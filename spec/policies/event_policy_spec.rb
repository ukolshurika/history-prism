require 'rails_helper'

RSpec.describe EventPolicy do
  subject { described_class }

  let(:user) { User.create!(email: 'test@example.com', password: 'password123', password_confirmation: 'password123') }
  let(:other_user) { User.create!(email: 'other@example.com', password: 'password123', password_confirmation: 'password123') }
  let(:event) { Event.create!(title: 'Test Event', description: 'Test Description', start_date: Time.now, end_date: Time.now + 1.day, category: :person, creator_id: user.id) }

  permissions :index? do
    it 'allows anyone to view the index' do
      expect(subject).to permit(nil, Event)
      expect(subject).to permit(user, Event)
    end
  end

  permissions :show? do
    it 'allows anyone to view an event' do
      expect(subject).to permit(nil, event)
      expect(subject).to permit(user, event)
      expect(subject).to permit(other_user, event)
    end
  end

  permissions :create? do
    it 'allows authenticated users to create events' do
      expect(subject).to permit(user, Event.new)
    end

    it 'denies unauthenticated users from creating events' do
      expect(subject).not_to permit(nil, Event.new)
    end
  end

  permissions :update? do
    it 'allows the creator to update their event' do
      expect(subject).to permit(user, event)
    end

    it 'denies other users from updating the event' do
      expect(subject).not_to permit(other_user, event)
    end

    it 'denies unauthenticated users from updating the event' do
      expect(subject).not_to permit(nil, event)
    end
  end

  permissions :destroy? do
    it 'allows the creator to delete their event' do
      expect(subject).to permit(user, event)
    end

    it 'denies other users from deleting the event' do
      expect(subject).not_to permit(other_user, event)
    end

    it 'denies unauthenticated users from deleting the event' do
      expect(subject).not_to permit(nil, event)
    end
  end

  describe 'Scope' do
    let!(:user_event) { Event.create!(title: 'User Event', description: 'Description', start_date: Time.now, end_date: Time.now + 1.day, category: :person, creator_id: user.id) }
    let!(:other_event) { Event.create!(title: 'Other Event', description: 'Description', start_date: Time.now, end_date: Time.now + 1.day, category: :world, creator_id: other_user.id) }

    it 'returns all events for any user' do
      scope = EventPolicy::Scope.new(user, Event).resolve
      expect(scope).to include(user_event, other_event)
      expect(scope.count).to eq(2)
    end

    it 'returns all events for unauthenticated users' do
      scope = EventPolicy::Scope.new(nil, Event).resolve
      expect(scope).to include(user_event, other_event)
      expect(scope.count).to eq(2)
    end
  end
end
