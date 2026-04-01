require 'rails_helper'

RSpec.describe 'GedcomFiles', type: :request do
  let(:user) { create :user }
  let(:other_user) { create :user }
  let(:gedcom_file) { create(:gedcom_file, user: user) }

  def sign_in(user)
    log_in_as_user user
  end

  def inertia_props(response)
    doc = Nokogiri::HTML(response.body)
    JSON.parse(doc.at('[data-page]')['data-page'])['props']
  end

  describe 'GET /gedcom_files' do
    context 'when user is signed in' do
      before { sign_in(user) }

      it 'renders the gedcom files index page' do
        get gedcom_files_path
        expect(response).to have_http_status(:success)
      end

      it 'displays only current user\'s gedcom files' do
        gedcom_file1 = create(:gedcom_file, user: user)
        gedcom_file2 = create(:gedcom_file, user: other_user)

        get gedcom_files_path
        expect(response).to have_http_status(:success)
        file_ids = inertia_props(response)['gedcom_files'].map { |item| item['id'] }
        expect(file_ids).to include(gedcom_file1.id)
        expect(file_ids).not_to include(gedcom_file2.id)
      end

      it 'returns paginated meta for gedcom files' do
        create_list(:gedcom_file, 30, user: user)

        get gedcom_files_path, params: { page: 2 }
        expect(response).to have_http_status(:success)

        meta = inertia_props(response)['meta']
        expect(meta['per_page']).to eq(25)
        expect(meta['total']).to eq(30)
        expect(meta['page']).to eq(2)
        expect(meta['total_pages']).to eq(2)
      end
    end

    context 'when user is not signed in' do
      it 'redirects to sign in page' do
        get gedcom_files_path
        expect(response).to redirect_to(new_session_path)
      end
    end
  end

  describe 'POST /gedcom_files' do
    let(:valid_file) { fixture_file_upload('test.ged', 'application/octet-stream') }
    let(:invalid_file) { fixture_file_upload('test.txt', 'text/plain') }
    let(:valid_params) { { file: valid_file } }

    context 'when user is signed in' do
      before { sign_in(user) }

      context 'with valid .ged file' do
        it 'creates a new gedcom file' do
          expect { post gedcom_files_path, params: valid_params }.to change(GedcomFile, :count).by(1)

          expect(GedcomFile.last.user_id).to eq(user.id)
          expect(GedcomFile.last.file).to be_attached
          expect(response).to redirect_to(gedcom_files_path)
        end

        it 'enqueues upload worker with correct arguments' do
          expect {
            post gedcom_files_path, params: valid_params
          }.to change(Gedcom::UploadWorker.jobs, :size).by(1)

          job = Gedcom::UploadWorker.jobs.last
          expect(job['args']).to eq([GedcomFile.last.id, user.id])
        end
      end

      context 'with invalid file extension' do
        let(:invalid_params) { { gedcom_file: { file: invalid_file } } }

        it 'does not create a new gedcom file' do
          expect { post gedcom_files_path, params: invalid_params }.not_to change(GedcomFile, :count)
          expect(response).to have_http_status(:success)
        end
      end

      context 'without file' do
        let(:empty_params) { { gedcom_file: { file: nil } } }

        it 'does not create a new gedcom file' do
          expect { post gedcom_files_path, params: empty_params }.not_to change(GedcomFile, :count)
          expect(response).to have_http_status(:success)
        end
      end
    end

    context 'when user is not signed in' do
      it 'redirects to sign in page' do
        post gedcom_files_path, params: valid_params
        expect(response).to redirect_to(new_session_path)
      end
    end
  end
end
