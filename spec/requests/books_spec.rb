# frozen_string_literal: true

require 'rails_helper'

RSpec.describe 'Books', type: :request do
  let(:user) { create(:user) }
  let(:other_user) { create(:user) }
  let(:book) { create(:book, creator: user) }

  def sign_in(user)
    log_in_as_user user
  end

  def inertia_props(response)
    doc = Nokogiri::HTML(response.body)
    JSON.parse(doc.at('[data-page]')['data-page'])['props']
  end

  describe 'GET /books' do
    context 'when user is signed in' do
      before { sign_in(user) }

      it 'renders the books index page' do
        get books_path
        expect(response).to have_http_status(:success)
      end

      it 'displays only current user\'s books' do
        create(:book, creator: user, name: 'Visible book')
        create(:book, creator: other_user, name: 'Hidden book')

        get books_path
        expect(response).to have_http_status(:success)
        names = inertia_props(response)['books'].map { |item| item['name'] }
        expect(names).to include('Visible book')
        expect(names).not_to include('Hidden book')
      end
    end

    context 'when user is not signed in' do
      it 'redirects to sign in page' do
        get books_path
        expect(response).to redirect_to(new_session_path)
      end
    end
  end

  describe 'GET /books/:id' do
    context 'when user is signed in' do
      before { sign_in(user) }

      it 'redirects to events filtered by book' do
        get book_path(book)
        expect(response).to redirect_to(events_path(source_type: 'Book', source_id: book.id))
      end

      it 'denies access to other user\'s book' do
        other_book = create(:book, creator: other_user)
        expect {
          get book_path(other_book)
        }.to raise_error(Pundit::NotAuthorizedError)
      end
    end

    context 'when user is not signed in' do
      it 'redirects to sign in page' do
        get book_path(book)
        expect(response).to redirect_to(new_session_path)
      end
    end
  end

  describe 'GET /books/new' do
    context 'when user is signed in' do
      before { sign_in(user) }

      it 'renders the new book form' do
        get new_book_path
        expect(response).to have_http_status(:success)
      end
    end

    context 'when user is not signed in' do
      it 'redirects to sign in page' do
        get new_book_path
        expect(response).to redirect_to(new_session_path)
      end
    end
  end

  describe 'POST /books' do
    let(:valid_file) { fixture_file_upload('test.pdf', 'application/pdf') }
    let(:invalid_file) { fixture_file_upload('test.txt', 'text/plain') }
    let(:valid_params) do
      {
        book: {
          name: 'My History Book',
          location: 'New York, USA',
          attachment: valid_file
        }
      }
    end

    context 'when user is signed in' do
      before { sign_in(user) }

      context 'with valid PDF file' do
        it 'creates a new book' do
          expect { post books_path, params: valid_params }.to change(Book, :count).by(1)

          expect(Book.last.creator_id).to eq(user.id)
          expect(Book.last.attachment).to be_attached
          expect(Book.last.name).to eq('My History Book')
          expect(Book.last.location).to eq('New York, USA')
          expect(response).to redirect_to(books_path)
        end

        it 'enqueues upload worker with correct arguments' do
          expect {
            post books_path, params: valid_params
          }.to have_enqueued_job(Book::UploadWorker).with(Book.last&.id || Integer)

          # Alternative for Sidekiq
          # expect(Book::UploadWorker.jobs.size).to change.by(1)
        end
      end

      context 'with invalid file extension' do
        let(:invalid_params) do
          {
            book: {
              name: 'My Book',
              attachment: invalid_file
            }
          }
        end

        it 'does not create a new book' do
          expect { post books_path, params: invalid_params }.not_to change(Book, :count)
          expect(response).to have_http_status(:success)
        end
      end

      context 'without file' do
        let(:empty_params) do
          {
            book: {
              name: 'My Book',
              attachment: nil
            }
          }
        end

        it 'does not create a new book' do
          expect { post books_path, params: empty_params }.not_to change(Book, :count)
          expect(response).to have_http_status(:success)
        end
      end
    end

    context 'when user is not signed in' do
      it 'redirects to sign in page' do
        post books_path, params: valid_params
        expect(response).to redirect_to(new_session_path)
      end
    end
  end

  describe 'GET /books/:id/edit' do
    context 'when user is signed in' do
      before { sign_in(user) }

      it 'renders the edit book form' do
        get edit_book_path(book)
        expect(response).to have_http_status(:success)
      end

      it 'denies access to other user\'s book' do
        other_book = create(:book, creator: other_user)
        expect {
          get edit_book_path(other_book)
        }.to raise_error(Pundit::NotAuthorizedError)
      end
    end

    context 'when user is not signed in' do
      it 'redirects to sign in page' do
        get edit_book_path(book)
        expect(response).to redirect_to(new_session_path)
      end
    end
  end

  describe 'PATCH /books/:id' do
    let(:update_params) do
      {
        book: {
          name: 'Updated Name',
          location: 'Updated Location'
        }
      }
    end

    context 'when user is signed in' do
      before { sign_in(user) }

      it 'updates the book' do
        patch book_path(book), params: update_params
        book.reload
        expect(book.name).to eq('Updated Name')
        expect(book.location).to eq('Updated Location')
        expect(response).to redirect_to(books_path)
      end

      it 'denies update to other user\'s book' do
        other_book = create(:book, creator: other_user)
        expect {
          patch book_path(other_book), params: update_params
        }.to raise_error(Pundit::NotAuthorizedError)
      end
    end

    context 'when user is not signed in' do
      it 'redirects to sign in page' do
        patch book_path(book), params: update_params
        expect(response).to redirect_to(new_session_path)
      end
    end
  end

  describe 'DELETE /books/:id' do
    context 'when user is signed in' do
      before { sign_in(user) }

      it 'deletes the book' do
        book # create book
        expect { delete book_path(book) }.to change(Book, :count).by(-1)
        expect(response).to redirect_to(books_path)
      end

      it 'deletes associated events' do
        event = create(:event, source: book)
        expect { delete book_path(book) }.to change(Event, :count).by(-1)
      end

      it 'denies deletion of other user\'s book' do
        other_book = create(:book, creator: other_user)
        expect {
          delete book_path(other_book)
        }.to raise_error(Pundit::NotAuthorizedError)
      end
    end

    context 'when user is not signed in' do
      it 'redirects to sign in page' do
        delete book_path(book)
        expect(response).to redirect_to(new_session_path)
      end
    end
  end
end
