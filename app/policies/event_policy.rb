# frozen_string_literal: true

class EventPolicy < ApplicationPolicy
  class Scope < Scope
    def resolve
      scope.visible_to(user)
    end
  end

  def index?
    true
  end

  def show?
    public_event? || owned_by_user?
  end

  def create?
    user.present?
  end

  def update?
    owned_by_user?
  end

  def destroy?
    owned_by_user?
  end

  private

  def public_event?
    !record.person?
  end

  def owned_by_user?
    user.present? && record.creator_id == user.id
  end
end
