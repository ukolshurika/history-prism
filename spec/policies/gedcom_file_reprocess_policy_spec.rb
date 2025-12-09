# frozen_string_literal: true

require 'rails_helper'

RSpec.describe GedcomFileReprocessPolicy, type: :policy do
  subject { described_class.new(user, gedcom_file) }

  let(:user) { create(:user) }
  let(:other_user) { create(:user) }
  let(:gedcom_file) { create(:gedcom_file, user: user) }
  let(:other_user_gedcom_file) { create(:gedcom_file, user: other_user) }

  describe '#create?' do
    context 'when user owns the gedcom file' do
      it 'permits the action' do
        expect(subject).to permit_action(:create)
      end
    end

    context 'when user does not own the gedcom file' do
      subject { described_class.new(user, other_user_gedcom_file) }

      it 'denies the action' do
        expect(subject).not_to permit_action(:create)
      end
    end

    context 'when user is not signed in' do
      subject { described_class.new(nil, gedcom_file) }

      it 'denies the action' do
        expect(subject).not_to permit_action(:create)
      end
    end
  end
end
