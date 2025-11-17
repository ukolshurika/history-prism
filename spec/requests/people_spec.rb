require 'rails_helper'

RSpec.describe 'People', type: :request do
  let(:user) { create :user }
  let(:other_user) { create :user }
  let(:person) { create(:person, user: user, first_name: 'John', last_name: 'Doe') }

  def sign_in(user)
    log_in_as_user user
  end

  describe 'GET /people' do
    before { sign_in(user) }

    it 'renders the people index page' do
      get people_path
      expect(response).to have_http_status(:success)
    end

    it 'displays only current user\'s people' do
      person1 = create(:person, user: user, first_name: 'Jane', last_name: 'Smith')
      person2 = create(:person, user: other_user, first_name: 'Bob', last_name: 'Jones')

      get people_path
      expect(response).to have_http_status(:success)
    end
  end

  describe 'GET /people/:id' do
    context 'when user owns the person' do
      before { sign_in(user) }

      it 'renders the person show page' do
        get person_path(person)
        expect(response).to have_http_status(:success)
      end
    end

    context 'when user does not own the person' do
      before { sign_in(other_user) }

      it 'returns not found error' do
        expect {
          get person_path(person)
        }.to raise_error(ActiveRecord::RecordNotFound)
      end
    end
  end

  describe 'GET /people/new' do
    context 'when user is signed in' do
      before { sign_in(user) }

      it 'renders the new person form' do
        get new_person_path
        expect(response).to have_http_status(:success)
      end
    end

    context 'when user is not signed in' do
      it 'redirects to sign in page' do
        get new_person_path
        expect(response).to redirect_to(new_session_path)
      end
    end
  end

  describe 'GET /people/:id/edit' do
    context 'when user owns the person' do
      before { sign_in(user) }

      it 'renders the edit person form' do
        get edit_person_path(person)
        expect(response).to have_http_status(:success)
      end
    end

    context 'when user does not own the person' do
      before { sign_in(other_user) }

      it 'returns not found error' do
        expect {
          get edit_person_path(person)
        }.to raise_error(ActiveRecord::RecordNotFound)
      end
    end

    context 'when user is not signed in' do
      it 'redirects to sign in page' do
        get edit_person_path(person)
        expect(response).to redirect_to(new_session_path)
      end
    end
  end

  describe 'POST /people' do
    let(:valid_params) do
      {
        person: {
          first_name: 'Alice',
          middle_name: 'Marie',
          last_name: 'Johnson',
          gedcom_uuid: '@P123@'
        }
      }
    end

    context 'when user is signed in' do
      before { sign_in(user) }

      context 'with valid parameters' do
        it 'creates a new person' do
          expect {
            post people_path, params: valid_params
          }.to change(Person, :count).by(1)

          expect(Person.last.first_name).to eq('Alice')
          expect(Person.last.user_id).to eq(user.id)
          expect(response).to redirect_to(person_path(Person.last))
        end
      end

      context 'with invalid parameters' do
        let(:invalid_params) do
          {
            person: {
              first_name: '',
              gedcom_uuid: ''
            }
          }
        end

        it 'does not create a new person' do
          expect {
            post people_path, params: invalid_params
          }.not_to change(Person, :count)
          expect(response).to have_http_status(:success)
        end
      end

      context 'with person-type events' do
        let!(:person_event) { create(:event, category: :person, creator: user) }
        let(:params_with_events) do
          {
            person: {
              first_name: 'Bob',
              gedcom_uuid: '@P456@',
              event_ids: [person_event.id]
            }
          }
        end

        it 'creates person with associated events' do
          expect {
            post people_path, params: params_with_events
          }.to change(Person, :count).by(1)

          expect(Person.last.events).to include(person_event)
        end
      end

      context 'with non-person-type events' do
        let!(:world_event) { create(:event, category: :world, creator: user) }
        let(:params_with_world_event) do
          {
            person: {
              first_name: 'Charlie',
              gedcom_uuid: '@P789@',
              event_ids: [world_event.id]
            }
          }
        end

        it 'does not create person with non-person-type events' do
          expect {
            post people_path, params: params_with_world_event
          }.not_to change(Person, :count)
          expect(response).to have_http_status(:success)
        end
      end
    end

    context 'when user is not signed in' do
      it 'redirects to sign in page' do
        post people_path, params: valid_params
        expect(response).to redirect_to(new_session_path)
      end
    end
  end

  describe 'PATCH /people/:id' do
    let(:update_params) do
      {
        person: {
          first_name: 'Updated Name',
          last_name: 'Updated Last'
        }
      }
    end

    context 'when user owns the person' do
      before { sign_in(user) }

      it 'updates the person' do
        patch person_path(person), params: update_params
        person.reload
        expect(person.first_name).to eq('Updated Name')
        expect(person.last_name).to eq('Updated Last')
        expect(response).to redirect_to(person_path(person))
      end
    end

    context 'when user does not own the person' do
      before { sign_in(other_user) }

      it 'does not update the person' do
        original_name = person.first_name
        expect {
          patch person_path(person), params: update_params
        }.to raise_error(ActiveRecord::RecordNotFound)
        person.reload
        expect(person.first_name).to eq(original_name)
      end
    end

    context 'when user is not signed in' do
      it 'redirects to sign in page' do
        patch person_path(person), params: update_params
        expect(response).to redirect_to(new_session_path)
      end
    end
  end

  describe 'DELETE /people/:id' do
    context 'when user owns the person' do
      before { sign_in(user) }

      it 'deletes the person' do
        person_to_delete = create(:person, user: user, first_name: 'ToDelete')

        expect {
          delete person_path(person_to_delete)
        }.to change(Person, :count).by(-1)
        expect(response).to redirect_to(people_path)
      end
    end

    context 'when user does not own the person' do
      before { sign_in(other_user) }

      it 'does not delete the person' do
        person
        expect {
          delete person_path(person)
        }.to raise_error(ActiveRecord::RecordNotFound)
      end
    end

    context 'when user is not signed in' do
      it 'redirects to sign in page' do
        delete person_path(person)
        expect(response).to redirect_to(new_session_path)
      end
    end
  end
end
