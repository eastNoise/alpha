import AppKit

private let width: CGFloat = 1320
private let height: CGFloat = 2868
private let root = FileManager.default.currentDirectoryPath
private struct SlideConfig: Decodable {
    let source: String
    let filename: String
    let title: String
    let redText: String
    let supportingText: String
}

private struct RenderConfig: Decodable {
    let locale: String
    let overviewTitle: String
    let overviewSubtitle: String
    let slides: [SlideConfig]
}

private let config: RenderConfig = {
    guard let argument = CommandLine.arguments.dropFirst().first else {
        fatalError("Usage: swift render-ko.swift <config.json>")
    }
    let path = argument.hasPrefix("/") ? argument : root + "/" + argument
    do {
        return try JSONDecoder().decode(RenderConfig.self, from: Data(contentsOf: URL(fileURLWithPath: path)))
    } catch {
        fatalError("Could not load render config: \(error)")
    }
}()

private let outputDirectory = root + "/release/aso-mockups/2026-08-12-review-fix/localized/" + config.locale
private let rawDirectory = root + "/release/screenshots/raw/" + config.locale
private let existingUploadDirectory = root + "/release/screenshots/upload/" + config.locale
private let iconPath = root + "/release/google-play/assets/app-icon-512.png"
private let backgroundPath = root + "/release/aso-mockups/2026-08-06/v2/product-background-source.png"

private let white = NSColor(calibratedWhite: 0.98, alpha: 1)
private let gray = NSColor(calibratedWhite: 0.69, alpha: 1)
private let red = NSColor(calibratedRed: 0.98, green: 0.075, blue: 0.095, alpha: 1)
private var activeHeight = height

private struct Slide {
    let source: String
    let filename: String
    let title: String
    let redText: String
    let supportingText: String
}

private let slides = config.slides.map {
    Slide(
        source: $0.source,
        filename: $0.filename,
        title: $0.title,
        redText: $0.redText,
        supportingText: $0.supportingText
    )
}

private let promotionalFiles = [
    "01-visual-90days.jpg",
    "02-visual-life.jpg",
    "03-visual-reforge.jpg",
]

private func makeBitmap(width: CGFloat, height: CGFloat) -> (NSBitmapImageRep, NSGraphicsContext) {
    let bitmap = NSBitmapImageRep(
        bitmapDataPlanes: nil,
        pixelsWide: Int(width),
        pixelsHigh: Int(height),
        bitsPerSample: 8,
        samplesPerPixel: 4,
        hasAlpha: true,
        isPlanar: false,
        colorSpaceName: .deviceRGB,
        bytesPerRow: 0,
        bitsPerPixel: 0
    )!
    bitmap.size = NSSize(width: width, height: height)
    return (bitmap, NSGraphicsContext(bitmapImageRep: bitmap)!)
}

private func begin(_ context: NSGraphicsContext, height: CGFloat) {
    NSGraphicsContext.current = context
    activeHeight = height
    context.shouldAntialias = true
    context.imageInterpolation = .high
}

private func canvasRect(_ rect: NSRect) -> NSRect {
    NSRect(x: rect.minX, y: activeHeight - rect.maxY, width: rect.width, height: rect.height)
}

private func fill(_ rect: NSRect, color: NSColor) {
    color.setFill()
    NSBezierPath(rect: canvasRect(rect)).fill()
}

private func fillRounded(_ rect: NSRect, radius: CGFloat, color: NSColor) {
    color.setFill()
    NSBezierPath(roundedRect: canvasRect(rect), xRadius: radius, yRadius: radius).fill()
}

private func strokeRounded(_ rect: NSRect, radius: CGFloat, color: NSColor, lineWidth: CGFloat) {
    color.setStroke()
    let path = NSBezierPath(roundedRect: canvasRect(rect), xRadius: radius, yRadius: radius)
    path.lineWidth = lineWidth
    path.stroke()
}

private func drawImage(_ image: NSImage, destination: NSRect) {
    image.draw(
        in: canvasRect(destination),
        from: NSRect(origin: .zero, size: image.size),
        operation: .sourceOver,
        fraction: 1,
        respectFlipped: false,
        hints: [.interpolation: NSImageInterpolation.high]
    )
}

private func drawText(_ text: String, rect: NSRect, font: NSFont, color: NSColor) {
    let paragraph = NSMutableParagraphStyle()
    paragraph.lineBreakMode = .byClipping
    (text as NSString).draw(
        with: canvasRect(rect),
        options: [.usesLineFragmentOrigin, .usesFontLeading],
        attributes: [
            .font: font,
            .foregroundColor: color,
            .paragraphStyle: paragraph,
        ]
    )
}

private func fittedFont(text: String, maximum: CGFloat, minimum: CGFloat, width: CGFloat, weight: NSFont.Weight) -> NSFont {
    var size = maximum
    while size > minimum {
        let font = NSFont.systemFont(ofSize: size, weight: weight)
        if (text as NSString).size(withAttributes: [.font: font]).width <= width {
            return font
        }
        size -= 2
    }
    return NSFont.systemFont(ofSize: minimum, weight: weight)
}

private func drawIdentity(icon: NSImage) {
    let iconFrame = NSRect(x: 70, y: 56, width: 56, height: 56)
    NSGraphicsContext.saveGraphicsState()
    NSBezierPath(roundedRect: canvasRect(iconFrame), xRadius: 14, yRadius: 14).addClip()
    drawImage(icon, destination: iconFrame)
    NSGraphicsContext.restoreGraphicsState()
    drawText(
        "ALPHA",
        rect: NSRect(x: 148, y: 62, width: 280, height: 45),
        font: NSFont.systemFont(ofSize: 34, weight: .bold),
        color: white
    )
}

private func drawHeadline(_ slide: Slide) {
    let titleFont = fittedFont(text: slide.title, maximum: 104, minimum: 76, width: 1180, weight: .heavy)
    let titleRange = (slide.title as NSString).range(of: slide.redText)
    let attributed = NSMutableAttributedString(
        string: slide.title,
        attributes: [.font: titleFont, .foregroundColor: white]
    )
    if titleRange.location != NSNotFound {
        attributed.addAttribute(.foregroundColor, value: red, range: titleRange)
    }
    let paragraph = NSMutableParagraphStyle()
    paragraph.lineBreakMode = .byClipping
    attributed.addAttribute(.paragraphStyle, value: paragraph, range: NSRange(location: 0, length: attributed.length))
    attributed.draw(
        with: canvasRect(NSRect(x: 70, y: 154, width: 1180, height: 126)),
        options: [.usesLineFragmentOrigin, .usesFontLeading]
    )
    drawText(
        slide.supportingText,
        rect: NSRect(x: 72, y: 296, width: 1170, height: 55),
        font: fittedFont(text: slide.supportingText, maximum: 34, minimum: 26, width: 1170, weight: .medium),
        color: gray
    )
    fill(NSRect(x: 72, y: 376, width: 82, height: 7), color: red)
}

private func render(slide: Slide, icon: NSImage, background: NSImage, screen: NSImage) throws -> NSBitmapImageRep {
    let (bitmap, context) = makeBitmap(width: width, height: height)
    begin(context, height: height)
    fill(NSRect(x: 0, y: 0, width: width, height: height), color: .black)
    drawImage(background, destination: NSRect(x: -1350, y: 0, width: 3960, height: height))
    fill(NSRect(x: 0, y: 0, width: width, height: height), color: NSColor.black.withAlphaComponent(0.82))
    drawIdentity(icon: icon)
    drawHeadline(slide)

    let screenFrame = NSRect(x: 135, y: 446, width: 1050, height: 2281)
    fillRounded(
        NSRect(x: screenFrame.minX + 15, y: screenFrame.minY + 22, width: screenFrame.width, height: screenFrame.height),
        radius: 54,
        color: NSColor.black.withAlphaComponent(0.72)
    )
    NSGraphicsContext.saveGraphicsState()
    NSBezierPath(roundedRect: canvasRect(screenFrame), xRadius: 48, yRadius: 48).addClip()
    drawImage(screen, destination: screenFrame)
    NSGraphicsContext.restoreGraphicsState()
    strokeRounded(screenFrame, radius: 48, color: NSColor.white.withAlphaComponent(0.2), lineWidth: 3)
    strokeRounded(screenFrame, radius: 48, color: red.withAlphaComponent(0.35), lineWidth: 1)
    NSGraphicsContext.current = nil
    return bitmap
}

private func writeJPEG(_ bitmap: NSBitmapImageRep, path: String, quality: CGFloat = 0.96) throws {
    guard let data = bitmap.representation(using: .jpeg, properties: [.compressionFactor: quality]) else {
        throw NSError(domain: "ALPHAReviewFix", code: 1, userInfo: [NSLocalizedDescriptionKey: "JPEG encoding failed"])
    }
    try data.write(to: URL(fileURLWithPath: path))
}

private func drawOverview(files: [String]) throws {
    let overviewWidth: CGFloat = 2210
    let overviewHeight: CGFloat = 2210
    let itemWidth: CGFloat = 420
    let itemHeight = itemWidth * height / width
    let startX: CGFloat = 115
    let startY: CGFloat = 175
    let gapX: CGFloat = 100
    let gapY: CGFloat = 95
    let (bitmap, context) = makeBitmap(width: overviewWidth, height: overviewHeight)
    begin(context, height: overviewHeight)
    fill(NSRect(x: 0, y: 0, width: overviewWidth, height: overviewHeight), color: NSColor(calibratedWhite: 0.055, alpha: 1))
    drawText(
        config.overviewTitle,
        rect: NSRect(x: startX, y: 60, width: 1220, height: 52),
        font: NSFont.systemFont(ofSize: 34, weight: .bold),
        color: white
    )
    drawText(
        config.overviewSubtitle,
        rect: NSRect(x: startX, y: 112, width: 1200, height: 38),
        font: NSFont.systemFont(ofSize: 24, weight: .medium),
        color: gray
    )
    for (index, filename) in files.enumerated() {
        guard let image = NSImage(contentsOfFile: outputDirectory + "/" + filename) else { continue }
        let column = index % 4
        let row = index / 4
        let frame = NSRect(
            x: startX + CGFloat(column) * (itemWidth + gapX),
            y: startY + CGFloat(row) * (itemHeight + gapY),
            width: itemWidth,
            height: itemHeight
        )
        fillRounded(NSRect(x: frame.minX + 12, y: frame.minY + 18, width: frame.width, height: frame.height), radius: 18, color: NSColor.black.withAlphaComponent(0.6))
        NSGraphicsContext.saveGraphicsState()
        NSBezierPath(roundedRect: canvasRect(frame), xRadius: 18, yRadius: 18).addClip()
        drawImage(image, destination: frame)
        NSGraphicsContext.restoreGraphicsState()
    }
    NSGraphicsContext.current = nil
    try writeJPEG(bitmap, path: outputDirectory + "/overview-8up.jpg", quality: 0.94)
}

guard
    let icon = NSImage(contentsOfFile: iconPath),
    let background = NSImage(contentsOfFile: backgroundPath)
else {
    fatalError("Missing icon or background source")
}

do {
    try FileManager.default.createDirectory(atPath: outputDirectory, withIntermediateDirectories: true)
    for filename in promotionalFiles {
        let source = URL(fileURLWithPath: existingUploadDirectory + "/" + filename)
        let destination = URL(fileURLWithPath: outputDirectory + "/" + filename)
        try Data(contentsOf: source).write(to: destination, options: .atomic)
    }
    for slide in slides {
        guard let screen = NSImage(contentsOfFile: rawDirectory + "/" + slide.source) else {
            fatalError("Missing source screenshot: \(slide.source)")
        }
        let bitmap = try render(slide: slide, icon: icon, background: background, screen: screen)
        try writeJPEG(bitmap, path: outputDirectory + "/" + slide.filename)
    }
    try drawOverview(files: promotionalFiles + slides.map(\.filename))
    print("Rendered \(config.locale) App Review correction assets to \(outputDirectory)")
} catch {
    fputs("Render failed: \(error)\n", stderr)
    exit(1)
}
