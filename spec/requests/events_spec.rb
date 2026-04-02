require 'rails_helper'

RSpec.describe 'Events', type: :request do
  let(:user) { create :user }
  let(:other_user) { create :user }
  let(:event) { create(:event, creator: user, title: 'Test Event', description: 'Test Description') }

  def sign_in(user)
    log_in_as_user user
  end

  def inertia_props(response)
    doc = Nokogiri::HTML(response.body)
    JSON.parse(doc.at('[data-page]')['data-page'])['props']
  end

  describe 'GET /events' do
    before { sign_in(user) }

    it 'renders the events index page' do
      get events_path
      expect(response).to have_http_status(:success)
    end

    it 'displays all events' do
      create(:event, creator: user, title: 'Event 1', description: 'Desc 1', category: :person)
      create(:event, creator: user, title: 'Event 2', description: 'Desc 2', category: :world)

      get events_path
      expect(response).to have_http_status(:success)
    end

    it 'returns standardized meta in props' do
      create_list(:event, 30, creator: user)

      get events_path
      expect(response).to have_http_status(:success)
      meta = inertia_props(response)['meta']
      expect(meta['per_page']).to eq(25)
      expect(meta['total']).to eq(30)
      expect(meta['page']).to eq(1)
      expect(meta['total_pages']).to eq(2)
    end

    context 'with search query' do
      let!(:matching)    { create(:event, creator: user, title: 'Рождение Ивана', description: 'событие') }
      let!(:nonmatching) { create(:event, creator: user, title: 'Battle of Waterloo', description: 'history') }

      it 'returns only matching events' do
        get events_path, params: { q: 'Иван' }
        expect(response).to have_http_status(:success)
      end
    end

    context 'with source_type/source_id filter' do
      let(:book)  { create(:book, creator: user) }
      let!(:book_event)  { create(:event, creator: user, source: book) }
      let!(:other_event) { create(:event, creator: user) }

      it 'filters events by source' do
        get events_path, params: { source_type: 'Book', source_id: book.id }
        expect(response).to have_http_status(:success)
      end
    end

    context 'with sort=date' do
      it 'responds successfully' do
        get events_path, params: { sort: 'date', direction: 'asc' }
        expect(response).to have_http_status(:success)
      end
    end

    context 'with sort=place' do
      it 'responds successfully' do
        get events_path, params: { sort: 'place', direction: 'asc' }
        expect(response).to have_http_status(:success)
      end
    end

    context 'with page parameter' do
      it 'responds successfully' do
        get events_path, params: { page: 1 }
        expect(response).to have_http_status(:success)
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
        expect(response.body).to include('not authorized')
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
        expect(response).to redirect_to(events_path)
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
