require 'rails_helper'

RSpec.describe Passwords::SendResetInstructionsJob, type: :job do
  describe '#perform' do
    let!(:user) { create(:user, email: 'person@example.com') }

    it 'sends reset instructions when the user exists' do
      expect {
        described_class.perform_now(user.email)
      }.to change(ActionMailer::Base.deliveries, :count).by(1)

      expect(ActionMailer::Base.deliveries.last.to).to eq([user.email])
    end

    it 'does nothing when the user does not exist' do
      expect {
        described_class.perform_now('missing@example.com')
      }.not_to change(ActionMailer::Base.deliveries, :count)
    end

    it 'does nothing for blank emails' do
      expect {
        described_class.perform_now('')
      }.not_to change(ActionMailer::Base.deliveries, :count)
    end
  end
end
