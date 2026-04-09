require 'rails_helper'

RSpec.describe 'Events', type: :request do
  let(:user) { create :user }
  let(:other_user) { create :user }
  let(:event) { create(:event, creator: user, title: 'Test Event', description: 'Test Description') }

  def sign_in(user)
    log_in_as_user user
  end

  def json_response(response)
    JSON.parse(response.body)
  end

  describe 'GET /events' do
    before { sign_in(user) }

    it 'redirects html requests to timelines index' do
      get events_path
      expect(response).to redirect_to(timelines_path)
    end

    it 'hides another user personal events from the index payload' do
      visible_personal_event = create(:event, creator: user, title: 'My personal event', category: :person)
      hidden_personal_event = create(:event, creator: other_user, title: 'Hidden personal event', category: :person)
      public_event = create(:event, :world_event, creator: other_user, title: 'Public event')

      get events_path(format: :json)

      serialized_titles = json_response(response).fetch('events').map { |serialized_event| serialized_event.fetch('title') }

      expect(serialized_titles).to include(visible_personal_event.title, public_event.title)
      expect(serialized_titles).not_to include(hidden_personal_event.title)
    end

    it 'returns standardized meta in props' do
      create_list(:event, 30, creator: user)

      get events_path(format: :json)
      expect(response).to have_http_status(:success)
      meta = json_response(response)['meta']
      expect(meta['per_page']).to eq(25)
      expect(meta['total']).to eq(30)
      expect(meta['page']).to eq(1)
      expect(meta['total_pages']).to eq(2)
    end

    context 'with search query' do
      let!(:matching)    { create(:event, creator: user, title: 'Рождение Ивана', description: 'событие') }
      let!(:nonmatching) { create(:event, creator: user, title: 'Battle of Waterloo', description: 'history') }

      it 'returns only matching events in JSON mode' do
        get events_path(format: :json), params: { q: 'Иван' }

        payload = json_response(response)
        titles = payload.fetch('events').map { |serialized_event| serialized_event.fetch('title') }

        expect(titles).to eq([matching.title])
        expect(payload.fetch('meta').fetch('total')).to eq(1)
      end
    end

    context 'with category filter' do
      let!(:world_event) { create(:event, creator: user, title: 'World Event', category: :world) }
      let!(:person_event) { create(:event, creator: user, title: 'Personal Event', category: :person) }

      it 'returns only events in the selected category' do
        get events_path(format: :json), params: { category: 'world' }

        payload = json_response(response)
        titles = payload.fetch('events').map { |serialized_event| serialized_event.fetch('title') }

        expect(titles).to eq([world_event.title])
        expect(payload.fetch('meta').fetch('total')).to eq(1)
      end
    end

    context 'with location radius filter' do
      let(:near_location) { create(:location, place: 'Moscow', latitude: 55.7558, longitude: 37.6173) }
      let(:far_location)  { create(:location, place: 'New York', latitude: 40.7128, longitude: -74.0060) }
      let!(:near_event) { create(:event, creator: user, title: 'Nearby event', location: near_location) }
      let!(:far_event) { create(:event, creator: user, title: 'Far event', location: far_location) }

      it 'returns only events within the requested radius' do
        get events_path(format: :json), params: { latitude: 55.7558, longitude: 37.6173, radius_km: 50 }

        payload = json_response(response)
        titles = payload.fetch('events').map { |serialized_event| serialized_event.fetch('title') }

        expect(titles).to eq([near_event.title])
        expect(payload.fetch('meta').fetch('total')).to eq(1)
      end
    end

    context 'with source_type/source_id filter' do
      let(:book)  { create(:book, creator: user) }
      let!(:book_event)  { create(:event, creator: user, source: book) }
      let!(:other_event) { create(:event, creator: user) }

      it 'filters events by source in JSON mode' do
        get events_path(format: :json), params: { source_type: 'Book', source_id: book.id }

        payload = json_response(response)
        titles = payload.fetch('events').map { |serialized_event| serialized_event.fetch('title') }

        expect(titles).to eq([book_event.title])
        expect(payload.fetch('meta').fetch('total')).to eq(1)
      end
    end

    context 'with sort=date' do
      let!(:later_event) { create(:event, creator: user, title: 'Later', start_date: create(:fuzzy_date, year: 1918, month: 1, day: 1)) }
      let!(:earlier_event) { create(:event, creator: user, title: 'Earlier', start_date: create(:fuzzy_date, year: 1917, month: 1, day: 1)) }

      it 'sorts events by date in JSON mode' do
        get events_path(format: :json), params: { sort: 'date', direction: 'asc' }

        payload = json_response(response)
        titles = payload.fetch('events').map { |serialized_event| serialized_event.fetch('title') }

        expect(titles.first).to eq(earlier_event.title)
      end
    end

    context 'with sort=place' do
      let!(:zurich_location) { create(:location, place: 'Zurich') }
      let!(:amsterdam_location) { create(:location, place: 'Amsterdam') }
      let!(:zurich_event) { create(:event, creator: user, title: 'Zurich event', location: zurich_location) }
      let!(:amsterdam_event) { create(:event, creator: user, title: 'Amsterdam event', location: amsterdam_location) }

      it 'sorts events by place in JSON mode' do
        get events_path(format: :json), params: { sort: 'place', direction: 'asc' }

        payload = json_response(response)
        titles = payload.fetch('events').map { |serialized_event| serialized_event.fetch('title') }

        expect(titles.first).to eq(amsterdam_event.title)
      end
    end

    context 'with page parameter' do
      it 'returns paginated JSON metadata and the requested page of events' do
        create_list(:event, 30, creator: user)

        get events_path(format: :json), params: { page: 2 }

        payload = json_response(response)

        expect(payload.fetch('events').length).to eq(5)
        expect(payload.fetch('meta').fetch('page')).to eq(2)
        expect(payload.fetch('meta').fetch('total_pages')).to eq(2)
      end
    end
  end

  describe 'GET /events/:id' do
    before { sign_in(user) }

    it 'renders the event show page' do
      get event_path(event)
      expect(response).to have_http_status(:success)
    end

      it 'redirects another user away from a personal event' do
      sign_in(other_user)

      get event_path(event)

      expect(response).to redirect_to(root_path)
    end

    it 'allows another user to view a public event' do
      public_event = create(:event, :world_event, creator: user)
      sign_in(other_user)

      get event_path(public_event)

      expect(response).to have_http_status(:success)
    end
  end

  describe 'GET /events/new' do
    context 'when user is signed in' do
      before { sign_in(user) }

      it 'renders the new event form' do
        get new_event_path
        expect(response).to have_http_status(:success)
      end
    end

    context 'when user is not signed in' do
      it 'redirects to sign in page' do
        get new_event_path
        expect(response).to redirect_to(new_session_path)
      end
    end
  end

  describe 'GET /events/:id/edit' do
    context 'when user owns the event' do
      before { sign_in(user) }

      it 'renders the edit event form' do
        get edit_event_path(event)
        expect(response).to have_http_status(:success)
      end

    end

    context 'when user does not own the event' do
      before { sign_in(other_user) }

      it 'redirects with authorization error' do
        get edit_event_path(event)
        expect(response).to redirect_to(root_path)
        follow_redirect!
        expect(response.body).to include('У вас нет прав для выполнения этого действия.')
      end
    end

    context 'when user is not signed in' do
      it 'redirects to sign in page' do
        get edit_event_path(event)
        expect(response).to redirect_to(new_session_path)
      end
    end
  end

  describe 'POST /events' do
    let(:valid_params) do
      {
        event: {
          title: 'New Event',
          description: 'Event Description',
          start_date: Time.now,
          end_date: Time.now + 1.day,
          category: 'person'
        }
      }
    end

    context 'when user is signed in' do
      before { sign_in(user) }

      context 'with valid parameters' do
        it 'creates a new event' do
          expect {
            post events_path, params: valid_params
          }.to change(Event, :count).by(1)

          expect(Event.last.title).to eq('New Event')
          expect(Event.last.creator_id).to eq(user.id)
          expect(response).to redirect_to(event_path(Event.last))
        end

        it 'redirects to the timeline and updates its cached events when timeline_id is provided' do
          timeline = create(:timeline, user: user)
          params_with_timeline = valid_params.deep_dup
          params_with_timeline[:event][:timeline_id] = timeline.id
          params_with_timeline[:event][:category] = 'local'
          params_with_timeline[:event][:start_date_attributes] = {
            year: '1917',
            month: '11',
            day: '7',
            date_type: 'exact',
            calendar_type: 'gregorian'
          }

          post events_path, params: params_with_timeline

          expect(response).to redirect_to(timeline_path(timeline))
          expect(timeline.reload.cached_events_for_display['local']).to include(Event.last.id)
          expect(Event.last.start_date.original_text).to eq('1917-11-07')
        end

        it 'creates a year-only event without duplicating fuzzy dates for a single-day entry' do
          expect {
            post events_path, params: {
              event: {
                title: 'Approximate event',
                description: 'Only a year is known',
                category: 'person',
                start_date_attributes: {
                  year: '1850',
                  date_type: 'year',
                  calendar_type: 'gregorian'
                }
              }
            }
          }.to change(Event, :count).by(1)
           .and change(FuzzyDate, :count).by(1)

          created_event = Event.last
          expect(created_event.start_date).to eq(created_event.end_date)
          expect(created_event.start_date.date_type).to eq('year')
          expect(created_event.start_date.original_text).to eq('1850')
        end

        it 'creates an approximate event using fuzzy date attributes' do
          expect {
            post events_path, params: {
              event: {
                title: 'Approximate event',
                description: 'Circa date',
                category: 'person',
                start_date_attributes: {
                  year: '1850',
                  date_type: 'about',
                  calendar_type: 'gregorian'
                }
              }
            }
          }.to change(Event, :count).by(1)
           .and change(FuzzyDate, :count).by(1)

          created_event = Event.last
          expect(created_event.start_date).to eq(created_event.end_date)
          expect(created_event.start_date.date_type).to eq('about')
          expect(created_event.start_date.original_text).to eq('ABT 1850')
        end
      end

      context 'with invalid parameters' do
        let(:invalid_params) do
          {
            event: {
              title: '',
              description: '',
              start_date: '',
              end_date: '',
              category: 'person'
            }
          }
        end

        it 'does not create a new event' do
          expect {
            post events_path, params: invalid_params
          }.not_to change(Event, :count)
          expect(response).to have_http_status(:success)
        end
      end
    end

    context 'when user is not signed in' do
      it 'redirects to sign in page' do
        post events_path, params: valid_params
        expect(response).to redirect_to(new_session_path)
      end
    end
  end

  describe 'PATCH /events/:id' do
    let(:update_params) do
      {
        event: {
          title: 'Updated Event',
          description: 'Updated Description'
        }
      }
    end

    context 'when user owns the event' do
      before { sign_in(user) }

      it 'updates the event' do
        patch event_path(event), params: update_params
        event.reload
        expect(event.title).to eq('Updated Event')
        expect(event.description).to eq('Updated Description')
        expect(response).to redirect_to(event_path(event))
      end

      it 'converts string form dates into FuzzyDate associations' do
        patch event_path(event), params: {
          event: {
            title: 'Updated Event',
            description: 'Updated Description',
            start_date: '1945-10-02',
            end_date: '1945-10-03'
          }
        }

        event.reload

        expect(response).to redirect_to(event_path(event))
        expect(event.start_date).to be_a(FuzzyDate)
        expect(event.end_date).to be_a(FuzzyDate)
        expect(event.start_date.original_text).to eq('1945-10-02')
        expect(event.end_date.original_text).to eq('1945-10-03')
      end

      it 'reuses a single fuzzy date row when start and end are identical' do
        event

        expect {
          patch event_path(event), params: {
            event: {
              title: 'Updated Event',
              description: 'Updated Description',
              start_date_attributes: {
                year: '1945',
                month: '10',
                day: '02',
                date_type: 'exact',
                calendar_type: 'gregorian'
              },
              end_date_attributes: {
                year: '1945',
                month: '10',
                day: '02',
                date_type: 'exact',
                calendar_type: 'gregorian'
              }
            }
          }
        }.to change(FuzzyDate, :count).by(1)

        event.reload

        expect(response).to redirect_to(event_path(event))
        expect(event.start_date).to eq(event.end_date)
        expect(event.start_date.original_text).to eq('1945-10-02')
      end
    end

    context 'when user does not own the event' do
      before { sign_in(other_user) }

      it 'does not update the event and redirects' do
        original_title = event.title
        patch event_path(event), params: update_params
        event.reload
        expect(event.title).to eq(original_title)
        expect(response).to redirect_to(root_path)
      end
    end

    context 'when user is not signed in' do
      it 'redirects to sign in page' do
        patch event_path(event), params: update_params
        expect(response).to redirect_to(new_session_path)
      end
    end
  end

  describe 'DELETE /events/:id' do
    context 'when user owns the event' do
      before { sign_in(user) }

      it 'deletes the event' do
        event_to_delete = create(:event, creator: user, title: 'To Delete', description: 'Will be deleted')

        expect {
          delete event_path(event_to_delete)
        }.to change(Event, :count).by(-1)
        expect(response).to redirect_to(timelines_path)
      end
    end

    context 'when user does not own the event' do
      before { sign_in(other_user) }

      it 'does not delete the event' do
        event
        expect {
          delete event_path(event)
        }.not_to change(Event, :count)
        expect(response).to redirect_to(root_path)
      end
    end

    context 'when user is not signed in' do
      it 'redirects to sign in page' do
        delete event_path(event)
        expect(response).to redirect_to(new_session_path)
      end
    end
  end
end
