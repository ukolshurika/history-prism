# frozen_string_literal: true

require 'rails_helper'

RSpec.describe Passwords::SendResetInstructionsWorker, type: :worker do
  let!(:user) { create(:user, email: 'person@example.com') }
  let(:worker) { described_class.new }

  describe '#perform' do
    it 'sends reset instructions when the user exists' do
      expect {
        worker.perform(user.email)
      }.to change(ActionMailer::Base.deliveries, :count).by(1)

      expect(ActionMailer::Base.deliveries.last.to).to eq([user.email])
    end

    it 'does nothing when the user does not exist' do
      expect {
        worker.perform('missing@example.com')
      }.not_to change(ActionMailer::Base.deliveries, :count)
    end

    it 'does nothing for blank emails' do
      expect {
        worker.perform('')
      }.not_to change(ActionMailer::Base.deliveries, :count)
    end
  end
end
