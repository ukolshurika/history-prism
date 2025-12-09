# frozen_string_literal: true

require 'rails_helper'

RSpec.describe TimelinePolicy, type: :policy do
  subject { described_class.new(user, timeline) }

  let(:user) { create(:user) }
  let(:other_user) { create(:user) }
  let(:person) { create(:person, user: user) }
  let(:timeline) { create(:timeline, user: user, person: person, visible: false) }
  let(:other_user_timeline) { create(:timeline, user: other_user, visible: false) }
  let(:public_timeline) { create(:timeline, user: other_user, visible: true) }

  describe '#index?' do
    context 'when user is signed in' do
      it 'permits the action' do
        expect(subject).to permit_action(:index)
      end
    end

    context 'when user is not signed in' do
      subject { described_class.new(nil, Timeline) }

      it 'denies the action' do
        expect(subject).not_to permit_action(:index)
      end
    end
  end

  describe '#show?' do
    context 'when user owns the timeline' do
      it 'permits the action' do
        expect(subject).to permit_action(:show)
      end
    end

    context 'when timeline is public' do
      subject { described_class.new(user, public_timeline) }

      it 'permits the action' do
        expect(subject).to permit_action(:show)
      end
    end

    context 'when timeline is private and belongs to another user' do
      subject { described_class.new(user, other_user_timeline) }

      it 'denies the action' do
        expect(subject).not_to permit_action(:show)
      end
    end

    context 'when user is not signed in' do
      subject { described_class.new(nil, timeline) }

      it 'denies the action' do
        expect(subject).not_to permit_action(:show)
      end
    end
  end

  describe '#create?' do
    context 'when user is signed in' do
      it 'permits the action' do
        expect(subject).to permit_action(:create)
      end
    end

    context 'when user is not signed in' do
      subject { described_class.new(nil, timeline) }

      it 'denies the action' do
        expect(subject).not_to permit_action(:create)
      end
    end
  end

  describe '#update?' do
    context 'when user owns the timeline' do
      it 'permits the action' do
        expect(subject).to permit_action(:update)
      end
    end

    context 'when user does not own the timeline' do
      subject { described_class.new(user, other_user_timeline) }

      it 'denies the action' do
        expect(subject).not_to permit_action(:update)
      end
    end
  end

  describe '#destroy?' do
    context 'when user owns the timeline' do
      it 'permits the action' do
        expect(subject).to permit_action(:destroy)
      end
    end

    context 'when user does not own the timeline' do
      subject { described_class.new(user, other_user_timeline) }

      it 'denies the action' do
        expect(subject).not_to permit_action(:destroy)
      end
    end
  end

  describe 'Scope' do
    let!(:my_timeline) { create(:timeline, user: user) }
    let!(:other_timeline) { create(:timeline, user: other_user) }

    it 'returns only user timelines' do
      scope = described_class::Scope.new(user, Timeline).resolve
      expect(scope).to include(my_timeline)
      expect(scope).not_to include(other_timeline)
    end
  end
end
