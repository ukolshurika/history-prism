# frozen_string_literal: true

module TimelinePdf
  class LatexTemplate
    YEARS_PER_PAGE = 10
    YEAR_SPACING_CM = 2.1 # cm between each year mark
    TIMELINE_X = 3 # x position of timeline spine in cm
    PAGE_TOP_Y = 26 # top of page in cm
    PAGE_BOTTOM_Y = 5 # bottom of usable area in cm

    def initialize(timeline, grouped_events)
      @timeline = timeline
      @grouped_events = grouped_events
      @person_name = timeline.person&.name || "#{timeline.person&.first_name} #{timeline.person&.last_name}".strip
    end

    def generate
      [
        document_header,
        title_section,
        generate_pages,
        document_footer
      ].join("\n")
    end

    private

    attr_reader :timeline, :grouped_events, :person_name

    def document_header
      <<~LATEX
        \\documentclass[a4paper,10pt]{article}
        \\usepackage[utf8]{inputenc}
        \\usepackage[T2A]{fontenc}
        \\usepackage[russian,english]{babel}
        \\usepackage{tikz}
        \\usepackage{geometry}
        \\usepackage{lmodern}

        \\geometry{
          a4paper,
          left=1.5cm,
          right=1.5cm,
          top=2cm,
          bottom=3cm
        }

        \\usetikzlibrary{positioning,calc}
        \\pagestyle{plain}

        \\begin{document}
      LATEX
    end

    def title_section
      <<~LATEX

        \\section*{Timeline: #{escape_latex(timeline.title)}}
        \\subsection*{#{escape_latex(person_name)}}
        \\vspace{0.5cm}
      LATEX
    end

    def generate_pages
      return "" if grouped_events.empty?

      years = grouped_events.keys.sort
      start_year = years.first
      end_year = years.last

      pages = []
      current_year = start_year

      while current_year <= end_year
        page_end_year = current_year + YEARS_PER_PAGE - 1
        pages << generate_page(current_year, [page_end_year, end_year].min)
        current_year += YEARS_PER_PAGE
      end

      pages.join("\n")
    end

    def generate_page(start_year, end_year)
      page_years = (start_year..end_year).to_a
      overflow_events = []

      tikz_content = <<~LATEX

        \\begin{tikzpicture}[remember picture]
          % Timeline spine
          \\draw[line width=2pt, gray] (#{TIMELINE_X}, #{PAGE_TOP_Y}) -- (#{TIMELINE_X}, #{PAGE_BOTTOM_Y});

      LATEX

      page_years.each_with_index do |year, idx|
        y_pos = PAGE_TOP_Y - (idx * YEAR_SPACING_CM)
        tikz_content += render_year_marker(year, y_pos)
        tikz_content += render_year_events(year, y_pos, overflow_events)
      end

      tikz_content += "\\end{tikzpicture}\n"

      # Add overflow footnotes if needed
      if overflow_events.any?
        tikz_content += render_overflow_footer(overflow_events)
      end

      tikz_content += "\\newpage\n"
      tikz_content
    end

    def render_year_marker(year, y_pos)
      <<~LATEX
          % Year #{year}
          \\node[anchor=east, font=\\bfseries] at (#{TIMELINE_X - 0.5}, #{y_pos}) {#{year}};
          \\draw[line width=1pt] (#{TIMELINE_X - 0.2}, #{y_pos}) -- (#{TIMELINE_X + 0.2}, #{y_pos});

      LATEX
    end

    def render_year_events(year, y_pos, overflow_events)
      year_data = grouped_events[year]
      return "" unless year_data

      latex = ""
      reference_num = overflow_events.length + 1

      # Personal events (blue, closest to timeline)
      if year_data[:personal].any?
        latex += render_category_events(
          year_data[:personal],
          y_pos,
          4.0, # x_start
          10.0, # x_end
          'blue!70',
          year_data[:has_overflow],
          overflow_events,
          reference_num
        )
        reference_num = overflow_events.length + 1
      end

      # Local events (green, middle)
      if year_data[:local].any?
        latex += render_category_events(
          year_data[:local],
          y_pos,
          11.0,
          15.0,
          'green!70',
          year_data[:has_overflow],
          overflow_events,
          reference_num
        )
        reference_num = overflow_events.length + 1
      end

      # World events (red, farthest)
      if year_data[:world].any?
        latex += render_category_events(
          year_data[:world],
          y_pos,
          16.0,
          19.0,
          'red!70',
          year_data[:has_overflow],
          overflow_events,
          reference_num
        )
      end

      latex
    end

    def render_category_events(events, y_pos, x_start, x_end, color, has_overflow, overflow_events, start_ref_num)
      latex = ""
      visible_count = has_overflow ? 2 : events.length

      events.first(visible_count).each_with_index do |event, idx|
        x_pos = x_start + (idx * 0.3)
        y_offset = idx * -0.3
        title = escape_latex(event[:display_title] || event[:title])

        latex += <<~LATEX
            \\node[anchor=west, font=\\small, text width=#{x_end - x_start - 0.5}cm, color=#{color}]
              at (#{x_pos}, #{y_pos + y_offset}) {#{title}};
        LATEX
      end

      # Add overflow references
      if has_overflow && events.length > 2
        events[2..-1].each_with_index do |event, idx|
          ref_num = start_ref_num + idx
          overflow_events << { number: ref_num, title: event[:display_title] || event[:title] }

          x_pos = x_start + ((idx + 2) % 3) * 0.3
          y_offset = -0.6 - ((idx / 3) * 0.3)

          latex += <<~LATEX
              \\node[anchor=west, font=\\small, color=#{color}]
                at (#{x_pos}, #{y_pos + y_offset}) {(#{ref_num})};
          LATEX
        end
      end

      latex
    end

    def render_overflow_footer(overflow_events)
      footer = <<~LATEX

        \\vspace{0.5cm}
        \\hrule
        \\vspace{0.3cm}
        {\\footnotesize
      LATEX

      overflow_events.each do |event|
        footer += "(#{event[:number]}) #{escape_latex(event[:title])}\\\\\n"
      end

      footer += "}\n"
      footer
    end

    def document_footer
      "\\end{document}\n"
    end

    def escape_latex(text)
      return "" if text.nil?

      text.to_s
        .gsub('\\', '\\textbackslash{}')
        .gsub('&', '\\&')
        .gsub('%', '\\%')
        .gsub('$', '\\$')
        .gsub('#', '\\#')
        .gsub('_', '\\_')
        .gsub('{', '\\{')
        .gsub('}', '\\}')
        .gsub('~', '\\textasciitilde{}')
        .gsub('^', '\\textasciicircum{}')
    end
  end
end
