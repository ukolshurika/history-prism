# frozen_string_literal: true

require 'rails_helper'

RSpec.describe LocalEventsWorker, type: :worker do
  let(:user) { create(:user) }
  let(:person) { create(:person, user: user) }
  let(:timeline) do
    create(:timeline, person: person, user: user,
                      start_at: Date.new(1900, 1, 1),
                      end_at: Date.new(1950, 12, 31))
  end
  let(:worker) { described_class.new }

  def event_for_year(year, **attrs)
    fd = create(:fuzzy_date, year: year)
    create(:event, start_date: fd, end_date: fd, **attrs)
  end

  describe '#perform' do
    context 'when local events exist within the date range' do
      let!(:event_in_range)    { event_for_year(1920, category: :local) }
      let!(:event_out_of_range) { event_for_year(1960, category: :local) }

      it 'adds in-range local events to cached_events_for_display' do
        worker.perform(timeline.id)
        timeline.reload

        expect(timeline.cached_events_for_display['local']).to include(event_in_range.id)
      end

      it 'excludes out-of-range local events' do
        worker.perform(timeline.id)
        timeline.reload

        expect(timeline.cached_events_for_display['local']).not_to include(event_out_of_range.id)
      end
    end

    context 'when non-local events exist within the date range' do
      let!(:world_event)  { event_for_year(1920, category: :world) }
      let!(:person_event) { event_for_year(1920, category: :person) }

      it 'does not include non-local events under the local key' do
        worker.perform(timeline.id)
        timeline.reload

        local_ids = timeline.cached_events_for_display['local'] || []
        expect(local_ids).not_to include(world_event.id, person_event.id)
      end
    end

    context 'when timeline has no start_at date (fallback to person events)' do
      let(:timeline) { create(:timeline, person: person, user: user, start_at: nil, end_at: nil) }
      let!(:person_ev) do
        fd = create(:fuzzy_date, year: 1900)
        create(:event, start_date: fd, end_date: fd, category: :person, creator: user, people: [person])
      end
      let!(:in_range) { event_for_year(1910, category: :local) }

      it 'falls back to person events to determine start year' do
        worker.perform(timeline.id)
        timeline.reload

        expect(timeline.cached_events_for_display['local']).to include(in_range.id)
      end
    end

    context 'when no date range can be determined' do
      let(:timeline) { create(:timeline, person: person, user: user, start_at: nil, end_at: nil) }

      it 'returns early without modifying cached_events_for_display' do
        expect { worker.perform(timeline.id) }
          .not_to change { timeline.reload.cached_events_for_display }
      end
    end

    context 'when existing person events are already cached' do
      let!(:existing_person_event) { event_for_year(1920, category: :person) }
      let!(:new_local_event)       { event_for_year(1920, category: :local) }

      before do
        timeline.update(cached_events_for_display: { 'person' => [existing_person_event.id] })
      end

      it 'merges local events without overwriting existing keys' do
        worker.perform(timeline.id)
        timeline.reload

        cached = timeline.cached_events_for_display
        expect(cached['person']).to include(existing_person_event.id)
        expect(cached['local']).to include(new_local_event.id)
      end
    end

    context 'when there are no local events in range' do
      it 'sets the local key to an empty array' do
        worker.perform(timeline.id)
        timeline.reload

        local_ids = timeline.cached_events_for_display['local']
        expect(local_ids).to eq([])
      end
    end

    context 'when timeline does not exist' do
      it 'raises ActiveRecord::RecordNotFound' do
        expect { worker.perform(999_999) }.to raise_error(ActiveRecord::RecordNotFound)
      end
    end
  end
end
