class User < ApplicationRecord
  has_secure_password
  has_many :sessions, dependent: :destroy
  has_many :events, foreign_key: 'creator_id', dependent: :destroy
  has_many :people, dependent: :destroy
  has_many :gedcom_files, dependent: :destroy
  has_many :books, foreign_key: 'creator_id', dependent: :destroy
  has_many :timelines, dependent: :destroy

  generates_token_for :email_confirmation, expires_in: 24.hours

  DISPOSABLE_EMAIL_DOMAINS = YAML.load_file(
    Rails.root.join('config', 'disposable_email_domains.yml')
  ).freeze

  normalizes :email, with: ->(e) { e.strip.downcase }

  validates :email,
            uniqueness: { case_sensitive: false },
            presence: true,
            format: {
              with: /@/,
              message: 'must be a valid email address'
            }

  validates :password,
            length: { minimum: 8, maximum: 72 },
            format: {
              with: /\A(?=.*[a-z])(?=.*[A-Z])(?=.*\d).+\z/,
              message: 'must contain uppercase, lowercase, and a digit'
            },
            if: :password_digest_changed?

  validate :not_disposable_email

  scope :confirmed, -> { where.not(confirmed_at: nil) }

  def confirmed?
    confirmed_at.present?
  end

  private

  def not_disposable_email
    return if email.blank?

    domain = email.split('@').last.to_s.downcase
    if DISPOSABLE_EMAIL_DOMAINS.include?(domain)
      errors.add(:email, 'от временных сервисов не принимаются')
    end
  end
end
