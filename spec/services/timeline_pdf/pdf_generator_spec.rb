require 'rails_helper'

RSpec.describe TimelinePdf::PdfGenerator do
  let(:timeline) { create(:timeline) }
  let(:generator) { described_class.new(timeline) }

  describe '#compile_latex' do
    before do
      allow(generator).to receive(:work_dir).and_return(Pathname('/tmp/pdf-test'))
      allow(generator).to receive(:tex_filename).and_return('timeline.tex')
      allow(generator).to receive(:log_path).and_return(Pathname('/tmp/pdf-test/timeline.log'))
      allow(generator).to receive(:pdf_path).and_return(Pathname('/tmp/pdf-test/timeline.pdf'))
      allow(generator).to receive(:cleanup_files)
    end

    it 'raises a compilation error when pdflatex times out' do
      allow(Open3).to receive(:capture3).and_raise(Timeout::Error)

      expect {
        generator.send(:compile_latex)
      }.to raise_error(TimelinePdf::PdfGenerator::CompilationError) { |error|
        expect(error.message).to include('timed out')
      }
    end

    it 'succeeds when pdflatex exits successfully and the PDF exists' do
      status = instance_double(Process::Status, success?: true)
      allow(Open3).to receive(:capture3).and_return(['', '', status], ['', '', status])
      allow(File).to receive(:exist?).with(Pathname('/tmp/pdf-test/timeline.pdf')).and_return(true)
      allow(File).to receive(:exist?).with(Pathname('/tmp/pdf-test/timeline.log')).and_return(false)

      expect { generator.send(:compile_latex) }.not_to raise_error
      expect(Open3).to have_received(:capture3).twice
    end
  end
end
