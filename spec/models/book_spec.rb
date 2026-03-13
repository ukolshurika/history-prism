# frozen_string_literal: true

require 'rails_helper'

RSpec.describe Book, type: :model do
  describe 'associations' do
    it { is_expected.to belong_to(:creator).class_name('User') }
    it { is_expected.to have_many(:events).dependent(:destroy) }
  end

  describe 'validations' do
    let(:user) { create(:user) }

    it 'is valid with valid attributes' do
      book = build(:book, creator: user)
      expect(book).to be_valid
    end

    it 'is invalid without a creator' do
      book = build(:book, creator: nil)
      expect(book).not_to be_valid
      expect(book.errors[:creator]).to include("can't be blank")
    end

    it 'is invalid without an attachment' do
      book = build(:book, :without_attachment)
      expect(book).not_to be_valid
      expect(book.errors[:attachment]).to include("can't be blank")
    end

    it 'is invalid with a non-PDF attachment' do
      book = build(:book)
      book.attachment.attach(
        io: StringIO.new('test content'),
        filename: 'test.txt',
        content_type: 'text/plain'
      )
      expect(book).not_to be_valid
      expect(book.errors[:attachment]).to include('must be a PDF file')
    end

    it 'is valid with a PDF attachment' do
      book = build(:book)
      book.attachment.attach(
        io: StringIO.new('%PDF-1.4 sample content'),
        filename: 'test.pdf',
        content_type: 'application/pdf'
      )
      expect(book).to be_valid
    end
  end

  describe 'polymorphic source association' do
    let(:book) { create(:book) }
    let(:event) { create(:event, source: book) }

    it 'allows events to have book as source' do
      expect(event.source).to eq(book)
      expect(event.source_type).to eq('Book')
      expect(book.events).to include(event)
    end

    it 'destroys associated events when book is deleted' do
      event # create the event
      expect { book.destroy }.to change(Event, :count).by(-1)
    end
  end

  describe '.ransackable_attributes' do
    it 'returns allowed attributes for searching' do
      expect(Book.ransackable_attributes).to include('id', 'creator_id', 'name', 'location', 'created_at', 'updated_at')
    end
  end

  describe '.ransackable_associations' do
    it 'returns allowed associations for searching' do
      expect(Book.ransackable_associations).to include('creator', 'events')
    end
  end
end
