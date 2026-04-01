require 'rails_helper'

RSpec.describe GedcomFile, type: :model do
  describe 'dependent associations' do
    let!(:gedcom_file) { create(:gedcom_file) }
    let!(:event) { create(:event, creator: gedcom_file.user, source: gedcom_file) }
    let!(:person) { create(:person, user: gedcom_file.user, gedcom_file: gedcom_file) }

    it 'destroys dependent events and people when the GEDCOM file is deleted' do
      expect {
        gedcom_file.destroy
      }.to change(Event, :count).by(-1)
       .and change(Person, :count).by(-1)
    end
  end
end
