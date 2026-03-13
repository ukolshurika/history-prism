require 'rails_helper'

RSpec.describe EventPolicy do
  subject { described_class }

  let(:user)       { create(:user) }
  let(:other_user) { create(:user) }
  let(:event)      { create(:event, creator: user) }

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
    let!(:user_event)  { create(:event, creator: user, category: :person) }
    let!(:other_event) { create(:event, creator: other_user, category: :world) }

    it 'returns all events for any user' do
      scope = EventPolicy::Scope.new(user, Event).resolve
      expect(scope).to include(user_event, other_event)
    end

    it 'returns all events for unauthenticated users' do
      scope = EventPolicy::Scope.new(nil, Event).resolve
      expect(scope).to include(user_event, other_event)
    end
  end
end
