# frozen_string_literal: true

require 'rails_helper'

RSpec.describe 'Timelines', type: :request do
  let(:user) { create :user }
  let(:other_user) { create :user }
  let(:person) { create(:person, user: user) }
  let(:timeline) { create(:timeline, user: user, person: person) }
  let(:other_user_timeline) { create(:timeline, user: other_user) }

  def sign_in(user)
    log_in_as_user user
  end

  describe 'GET /timelines' do
    context 'when user is signed in' do
      before { sign_in(user) }

      it 'renders the timelines index page' do
        get timelines_path
        expect(response).to have_http_status(:success)
      end

      it 'displays only current user\'s timelines' do
        timeline1 = create(:timeline, user: user)
        timeline2 = create(:timeline, user: other_user)

        get timelines_path
        expect(response).to have_http_status(:success)
      end
    end

    context 'when user is not signed in' do
      it 'redirects to sign in page' do
        get timelines_path
        expect(response).to redirect_to(new_session_path)
      end
    end
  end

  describe 'GET /timelines/:id' do
    context 'when user is signed in' do
      before { sign_in(user) }

      context 'with own timeline' do
        it 'renders the timeline show page' do
          get timeline_path(timeline)
          expect(response).to have_http_status(:success)
        end
      end

      context 'with another user\'s private timeline' do
        it 'redirects back with alert' do
          get timeline_path(other_user_timeline)
          expect(response).to have_http_status(:redirect)
          expect(flash[:alert]).to eq('You are not authorized to perform this action.')
        end
      end

      context 'with public timeline' do
        let(:public_timeline) { create(:timeline, user: other_user, visible: true) }

        it 'renders the timeline show page' do
          get timeline_path(public_timeline)
          expect(response).to have_http_status(:success)
        end
      end
    end

    context 'when user is not signed in' do
      it 'redirects to sign in page' do
        get timeline_path(timeline)
        expect(response).to redirect_to(new_session_path)
      end
    end
  end

  describe 'POST /timelines' do
    let(:valid_params) { { timeline: { title: 'My Timeline', person_id: person.id, visible: false } } }

    context 'when user is signed in' do
      before { sign_in(user) }

      context 'with valid params' do
        it 'creates a new timeline' do
          expect { post timelines_path, params: valid_params }.to change(Timeline, :count).by(1)

          expect(Timeline.last.user_id).to eq(user.id)
          expect(Timeline.last.person_id).to eq(person.id)
          expect(response).to redirect_to(timelines_path)
        end

        it 'enqueues TimelineWorker with correct arguments' do
          expect {
            post timelines_path, params: valid_params
          }.to change(TimelineWorker.jobs, :size).by(1)

          job = TimelineWorker.jobs.last
          expect(job['args']).to eq([Timeline.last.id, user.id])
        end
      end

      context 'with invalid params' do
        let(:invalid_params) { { timeline: { title: '', person_id: nil } } }

        it 'does not create a new timeline' do
          expect { post timelines_path, params: invalid_params }.not_to change(Timeline, :count)
          expect(response).to have_http_status(:success)
        end
      end
    end

    context 'when user is not signed in' do
      it 'redirects to sign in page' do
        post timelines_path, params: valid_params
        expect(response).to redirect_to(new_session_path)
      end
    end
  end

  describe 'PATCH /timelines/:id' do
    let(:update_params) { { timeline: { title: 'Updated Title', visible: true } } }

    context 'when user is signed in' do
      before { sign_in(user) }

      context 'with own timeline' do
        it 'updates the timeline' do
          patch timeline_path(timeline), params: update_params

          timeline.reload
          expect(timeline.title).to eq('Updated Title')
          expect(timeline.visible).to be true
          expect(response).to redirect_to(timeline_path(timeline))
        end

        it 'does not allow changing person_id' do
          new_person = create(:person, user: user)
          patch timeline_path(timeline), params: { timeline: { person_id: new_person.id } }

          timeline.reload
          expect(timeline.person_id).not_to eq(new_person.id)
        end
      end

      context 'with another user\'s timeline' do
        it 'does not update the timeline' do
          patch timeline_path(other_user_timeline), params: update_params

          expect(response).to have_http_status(:redirect)
          expect(flash[:alert]).to eq('You are not authorized to perform this action.')
        end
      end
    end

    context 'when user is not signed in' do
      it 'redirects to sign in page' do
        patch timeline_path(timeline), params: update_params
        expect(response).to redirect_to(new_session_path)
      end
    end
  end

  describe 'DELETE /timelines/:id' do
    context 'when user is signed in' do
      before { sign_in(user) }

      context 'with own timeline' do
        it 'deletes the timeline' do
          timeline_to_delete = create(:timeline, user: user)

          expect { delete timeline_path(timeline_to_delete) }.to change(Timeline, :count).by(-1)
          expect(response).to redirect_to(timelines_path)
        end
      end

      context 'with another user\'s timeline' do
        it 'does not delete the timeline and redirects with alert' do
          timeline_to_keep = create(:timeline, user: other_user)
          expect {
            delete timeline_path(timeline_to_keep)
          }.not_to change(Timeline, :count)

          expect(response).to have_http_status(:redirect)
          expect(flash[:alert]).to eq('You are not authorized to perform this action.')
        end
      end
    end

    context 'when user is not signed in' do
      it 'redirects to sign in page' do
        delete timeline_path(timeline)
        expect(response).to redirect_to(new_session_path)
      end
    end
  end
end
