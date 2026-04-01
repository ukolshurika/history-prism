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
    let(:public_event) { create(:event, :world_event, creator: other_user) }

    it 'allows anyone to view a public event' do
      expect(subject).to permit(nil, public_event)
      expect(subject).to permit(user, public_event)
      expect(subject).to permit(other_user, public_event)
    end

    it 'allows the owner to view a personal event' do
      expect(subject).to permit(user, event)
    end

    it 'denies non-owners from viewing a personal event' do
      expect(subject).not_to permit(nil, event)
      expect(subject).not_to permit(other_user, event)
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
    let!(:owned_person_event)   { create(:event, creator: user, category: :person) }
    let!(:other_person_event)   { create(:event, creator: other_user, category: :person) }
    let!(:public_world_event)   { create(:event, creator: other_user, category: :world) }
    let!(:public_country_event) { create(:event, creator: other_user, category: :country) }
    let!(:public_local_event)   { create(:event, creator: other_user, category: :local) }

    it 'returns public events and owned personal events for an authenticated user' do
      scope = EventPolicy::Scope.new(user, Event).resolve

      expect(scope).to include(owned_person_event, public_world_event, public_country_event, public_local_event)
      expect(scope).not_to include(other_person_event)
    end

    it 'returns only public events for unauthenticated users' do
      scope = EventPolicy::Scope.new(nil, Event).resolve

      expect(scope).to include(public_world_event, public_country_event, public_local_event)
      expect(scope).not_to include(owned_person_event, other_person_event)
    end
  end
end
