# frozen_string_literal: true

require 'rails_helper'

RSpec.describe GedcomParser::UploadWorker, type: :worker do
  let(:user) { create(:user) }
  let(:gedcom_file) { create(:gedcom_file, user: user) }
  let(:blob_key) { gedcom_file.file.attachment.key }
  let(:worker) { described_class.new }

  describe '#perform' do
    context 'when gedcom file exists' do
      before do
        allow(GedcomParserApi).to receive(:get_events).and_return(
          double(status: 200, body: { status: 'Ok' }.to_json)
        )
      end

      it 'calls GedcomParserApi.get_events with correct arguments' do
        worker.perform(user.id, gedcom_file.id)

        expect(GedcomParserApi).to have_received(:get_events).with(blob_key, user.id)
      end

      it 'does not raise an error' do
        expect { worker.perform(user.id, gedcom_file.id) }.not_to raise_error
      end
    end

    context 'when gedcom file does not exist' do
      let(:invalid_file_id) { 99_999 }

      it 'raises ActiveRecord::RecordNotFound' do
        expect { worker.perform(user.id, invalid_file_id) }.to raise_error(ActiveRecord::RecordNotFound)
      end

      it 'does not call GedcomParserApi.get_events' do
        allow(GedcomParserApi).to receive(:get_events)

        begin
          worker.perform(user.id, invalid_file_id)
        rescue ActiveRecord::RecordNotFound
          # Expected error
        end

        expect(GedcomParserApi).not_to have_received(:get_events)
      end
    end

    context 'when API returns error' do
      before do
        allow(GedcomParserApi).to receive(:get_events).and_raise(
          GedcomParserApi::Transport::ClientError.new('422 Invalid file format')
        )
      end

      it 'raises GedcomParserApi::Transport::ClientError' do
        expect { worker.perform(user.id, gedcom_file.id) }.to raise_error(
          GedcomParserApi::Transport::ClientError,
          '422 Invalid file format'
        )
      end
    end

    context 'when network error occurs' do
      before do
        allow(GedcomParserApi).to receive(:get_events).and_raise(
          GedcomParserApi::Transport::Error.new('Connection refused')
        )
      end

      it 'raises GedcomParserApi::Transport::Error' do
        expect { worker.perform(user.id, gedcom_file.id) }.to raise_error(
          GedcomParserApi::Transport::Error,
          'Connection refused'
        )
      end
    end

    context 'integration with API stub' do
      let(:api_response) do
        double(status: 200, body: { status: 'Ok', processed: true }.to_json, success?: true)
      end

      before { allow(GedcomParserApi).to receive(:get_events).and_return(api_response) }

      it 'successfully processes the file' do
        result = worker.perform(user.id, gedcom_file.id)

        expect(result).to eq(api_response)
        expect(GedcomParserApi).to have_received(:get_events).once
      end
    end
  end
end
