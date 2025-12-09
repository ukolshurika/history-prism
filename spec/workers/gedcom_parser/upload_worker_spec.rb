# frozen_string_literal: true

require 'rails_helper'

RSpec.describe GedcomParser::UploadWorker, type: :worker do
  let(:user) { create(:user) }
  let(:gedcom_file) { create(:gedcom_file, user: user) }
  let(:blob_key) { gedcom_file.file.attachment.key }
  let(:worker) { described_class.new }

  describe '#perform' do
    context 'when gedcom file exists' do
      let(:api_response) { { 'persons' => ['person1', 'person2', 'person3'] } }

      before do
        allow(GedcomParserApi).to receive(:people).and_return(api_response)
        allow(GedcomParser::CreatePersonWorker).to receive(:perform_async)
      end

      it 'calls GedcomParserApi.people with correct key' do
        worker.perform(gedcom_file.id, user.id)

        expect(GedcomParserApi).to have_received(:people).with(blob_key)
      end

      it 'enqueues CreatePersonWorker for each person' do
        worker.perform(gedcom_file.id, user.id)

        expect(GedcomParser::CreatePersonWorker).to have_received(:perform_async).exactly(3).times
        expect(GedcomParser::CreatePersonWorker).to have_received(:perform_async).with(gedcom_file.id, blob_key, 'person1', user.id)
        expect(GedcomParser::CreatePersonWorker).to have_received(:perform_async).with(gedcom_file.id, blob_key, 'person2', user.id)
        expect(GedcomParser::CreatePersonWorker).to have_received(:perform_async).with(gedcom_file.id, blob_key, 'person3', user.id)
      end

      it 'does not raise an error' do
        expect { worker.perform(gedcom_file.id, user.id) }.not_to raise_error
      end
    end

    context 'when gedcom file does not exist' do
      let(:invalid_file_id) { 99_999 }

      it 'raises ActiveRecord::RecordNotFound' do
        expect { worker.perform(invalid_file_id, user.id) }.to raise_error(ActiveRecord::RecordNotFound)
      end

      it 'does not call GedcomParserApi.people' do
        allow(GedcomParserApi).to receive(:people)

        begin
          worker.perform(invalid_file_id, user.id)
        rescue ActiveRecord::RecordNotFound
          # Expected error
        end

        expect(GedcomParserApi).not_to have_received(:people)
      end
    end

    context 'when API returns error' do
      before do
        allow(GedcomParserApi).to receive(:people).and_raise(
          GedcomParserApi::Transport::ClientError.new('422 Invalid file format')
        )
      end

      it 'raises GedcomParserApi::Transport::ClientError' do
        expect { worker.perform(gedcom_file.id, user.id) }.to raise_error(
          GedcomParserApi::Transport::ClientError,
          '422 Invalid file format'
        )
      end
    end

    context 'when network error occurs' do
      before do
        allow(GedcomParserApi).to receive(:people).and_raise(
          GedcomParserApi::Transport::Error.new('Connection refused')
        )
      end

      it 'raises GedcomParserApi::Transport::Error' do
        expect { worker.perform(gedcom_file.id, user.id) }.to raise_error(
          GedcomParserApi::Transport::Error,
          'Connection refused'
        )
      end
    end

    context 'when API returns empty persons list' do
      let(:api_response) { { 'persons' => [] } }

      before do
        allow(GedcomParserApi).to receive(:people).and_return(api_response)
        allow(GedcomParser::CreatePersonWorker).to receive(:perform_async)
      end

      it 'does not enqueue any CreatePersonWorker' do
        worker.perform(gedcom_file.id, user.id)

        expect(GedcomParser::CreatePersonWorker).not_to have_received(:perform_async)
      end
    end
  end
end
