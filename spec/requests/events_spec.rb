require 'rails_helper'

RSpec.describe 'Events', type: :request do
  let(:user) { create :user }
  let(:other_user) { create :user }
  let(:event) { create(:event, creator: user, title: 'Test Event', description: 'Test Description') }

  def sign_in(user)
    log_in_as_user user
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
  end

  describe 'GET /events/:id' do
    before { sign_in(user) }
    it 'renders the event show page' do
      get event_path(event)
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
