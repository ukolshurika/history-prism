# frozen_string_literal: true

require 'rails_helper'

RSpec.describe Timeline, type: :model do
  describe 'associations' do
    it { should belong_to(:person) }
    it { should belong_to(:user) }
  end

  describe 'validations' do
    it { should validate_presence_of(:title) }
    it { should validate_presence_of(:person_id) }
    it { should validate_presence_of(:user_id) }
  end

  describe 'factory' do
    it 'has a valid factory' do
      timeline = create(:timeline)
      expect(timeline).to be_valid
    end
  end
end
