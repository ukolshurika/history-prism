# frozen_string_literal: true

class BooksController < ApplicationController
  before_action :set_book, only: [:show, :edit, :update, :destroy]

  def index
    @books = policy_scope(Book).order(created_at: :desc)

    render inertia: 'Books/Index', props: {
      books: ActiveModelSerializers::SerializableResource.new(@books, each_serializer: BookSerializer).as_json,
      current_user: current_user
    }
  end

  def show
    authorize @book
    redirect_to events_path(source_type: 'Book', source_id: @book.id)
  end

  def new
    @book = Book.new
    authorize @book

    render inertia: 'Books/Form', props: {
      book: {
        name: '',
        location: ''
      },
      isEdit: false
    }
  end

  def create
    @book = Current.user.books.build(book_params)
    authorize @book

    if @book.save
      Books::UploadWorker.perform_async(@book.id)
      redirect_to books_path, notice: 'Book was successfully uploaded.'
    else
      render inertia: 'Books/Form', props: {
        book: book_params,
        errors: @book.errors.full_messages,
        isEdit: false
      }
    end
  end

  def edit
    authorize @book

    render inertia: 'Books/Form', props: {
      book: BookSerializer.new(@book).as_json,
      isEdit: true
    }
  end

  def update
    authorize @book

    if @book.update(update_params)
      redirect_to books_path, notice: 'Book was successfully updated.'
    else
      render inertia: 'Books/Form', props: {
        book: BookSerializer.new(@book).as_json,
        errors: @book.errors.full_messages,
        isEdit: true
      }
    end
  end

  def destroy
    authorize @book
    @book.destroy

    redirect_to books_path, notice: 'Book was successfully deleted.'
  end

  private

  def set_book
    @book = Book.find(params[:id])
  end

  def book_params
    params.permit(:attachment, :name, :location, :latitude, :longitude)
  end

  def update_params
    params.permit(:name, :location, :latitude, :longitude)
  end
end
