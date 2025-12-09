# frozen_string_literal: true

require 'rails_helper'

RSpec.describe 'GedcomFileReprocesses', type: :request do
  let(:user) { create :user }
  let(:other_user) { create :user }
  let(:gedcom_file) { create(:gedcom_file, user: user) }
  let(:other_user_gedcom_file) { create(:gedcom_file, user: other_user) }

  def sign_in(user)
    log_in_as_user user
  end

  describe 'POST /gedcom_files/:gedcom_file_id/reprocess' do
    context 'when user is signed in' do
      before { sign_in(user) }

      context 'with own gedcom file' do
        it 'enqueues UploadWorker with correct arguments' do
          expect {
            post gedcom_file_reprocess_path(gedcom_file)
          }.to change(GedcomParser::UploadWorker.jobs, :size).by(1)

          job = GedcomParser::UploadWorker.jobs.last
          expect(job['args']).to eq([gedcom_file.id, user.id])
        end

        it 'redirects to gedcom files index with success notice' do
          post gedcom_file_reprocess_path(gedcom_file)

          expect(response).to redirect_to(gedcom_files_path)
          expect(flash[:notice]).to eq('GEDCOM file reprocessing has been started.')
        end

        it 'does not raise an error' do
          expect {
            post gedcom_file_reprocess_path(gedcom_file)
          }.not_to raise_error
        end
      end

      context 'with another user\'s gedcom file' do
        it 'redirects back with alert' do
          post gedcom_file_reprocess_path(other_user_gedcom_file)

          expect(response).to have_http_status(:redirect)
          expect(flash[:alert]).to eq('You are not authorized to perform this action.')
        end

        it 'does not enqueue UploadWorker' do
          expect {
            post gedcom_file_reprocess_path(other_user_gedcom_file)
          }.not_to change(GedcomParser::UploadWorker.jobs, :size)
        end
      end

      context 'with non-existent gedcom file' do
        it 'raises ActiveRecord::RecordNotFound' do
          expect {
            post gedcom_file_reprocess_path(gedcom_file_id: 99999)
          }.to raise_error(ActiveRecord::RecordNotFound)
        end
      end
    end

    context 'when user is not signed in' do
      it 'redirects to sign in page' do
        post gedcom_file_reprocess_path(gedcom_file)
        expect(response).to redirect_to(new_session_path)
      end

      it 'does not enqueue UploadWorker' do
        expect {
          post gedcom_file_reprocess_path(gedcom_file)
        }.not_to change(GedcomParser::UploadWorker.jobs, :size)
      end
    end
  end
end
