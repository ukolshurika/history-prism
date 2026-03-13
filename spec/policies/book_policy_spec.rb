# frozen_string_literal: true

require 'rails_helper'

RSpec.describe BookPolicy do
  subject { described_class }

  let(:user) { create(:user) }
  let(:other_user) { create(:user) }
  let(:book) { create(:book, creator: user) }

  permissions :index? do
    it 'allows authenticated users to view the index' do
      expect(subject).to permit(user, Book)
    end

    it 'denies unauthenticated users from viewing the index' do
      expect(subject).not_to permit(nil, Book)
    end
  end

  permissions :show? do
    it 'allows the creator to view their book' do
      expect(subject).to permit(user, book)
    end

    it 'denies other users from viewing the book' do
      expect(subject).not_to permit(other_user, book)
    end

    it 'denies unauthenticated users from viewing the book' do
      expect(subject).not_to permit(nil, book)
    end
  end

  permissions :create? do
    it 'allows authenticated users to create books' do
      expect(subject).to permit(user, Book.new)
    end

    it 'denies unauthenticated users from creating books' do
      expect(subject).not_to permit(nil, Book.new)
    end
  end

  permissions :update? do
    it 'allows the creator to update their book' do
      expect(subject).to permit(user, book)
    end

    it 'denies other users from updating the book' do
      expect(subject).not_to permit(other_user, book)
    end

    it 'denies unauthenticated users from updating the book' do
      expect(subject).not_to permit(nil, book)
    end
  end

  permissions :destroy? do
    it 'allows the creator to delete their book' do
      expect(subject).to permit(user, book)
    end

    it 'denies other users from deleting the book' do
      expect(subject).not_to permit(other_user, book)
    end

    it 'denies unauthenticated users from deleting the book' do
      expect(subject).not_to permit(nil, book)
    end
  end

  describe 'Scope' do
    let!(:user_book) { create(:book, creator: user) }
    let!(:other_book) { create(:book, creator: other_user) }

    it 'returns only the user\'s books' do
      scope = BookPolicy::Scope.new(user, Book).resolve
      expect(scope).to include(user_book)
      expect(scope).not_to include(other_book)
      expect(scope.count).to eq(1)
    end

    it 'returns no books for unauthenticated users' do
      scope = BookPolicy::Scope.new(nil, Book).resolve
      expect(scope).to be_empty
    end
  end
end
