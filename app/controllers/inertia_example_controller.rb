# frozen_string_literal: true

class InertiaExampleController < ActionController::Base
  include InertiaRails::Controller
  protect_from_forgery with: :exception
  
  def index
    render inertia: 'InertiaExample', props: {
      name: params.fetch(:name, 'World'),
    }
  end
end
