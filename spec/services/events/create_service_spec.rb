require 'rails_helper'

RSpec.describe Events::CreateService do
  describe '#call' do
    let(:user) { create(:user) }
    let(:timeline) { create(:timeline, user: user) }
    let(:params) do
      ActionController::Parameters.new(
        title: 'Service Event',
        description: 'Created via service',
        category: 'local',
        timeline_id: timeline.id,
        start_date_attributes: {
          year: '1917',
          month: '11',
          day: '7',
          date_type: 'exact',
          calendar_type: 'gregorian'
        },
        end_date_attributes: {
          year: '1918',
          month: '01',
          day: '01',
          date_type: 'exact',
          calendar_type: 'gregorian'
        }
      ).permit!
    end

    it 'creates the event and fuzzy dates in a transaction' do
      result = nil

      expect {
        result = described_class.new(user: user, params: params).call
      }.to change(Event, :count).by(1)
       .and change(FuzzyDate, :count).by(2)

      event = result.event
      expect(event.creator).to eq(user)
      expect(event.title).to eq('Service Event')
      expect(event.start_date.original_text).to eq('1917-11-07')
      expect(event.end_date.original_text).to eq('1918-01-01')
    end

    it 'updates the timeline cache under a lock' do
      allow(timeline).to receive(:with_lock).and_call_original

      result = described_class.new(user: user, params: params).call

      expect(timeline).to have_received(:with_lock)
      expect(result.timeline).to eq(timeline)
      expect(timeline.reload.cached_events_for_display['local']).to include(result.event.id)
    end

    it 'does not update a timeline when no timeline_id is provided' do
      result = described_class.new(
        user: user,
        params: params.except(:timeline_id)
      ).call

      expect(result.timeline).to be_nil
    end
  end
end
