import AppKit

private let canvasWidth: CGFloat = 1200
private let canvasHeight: CGFloat = 1500
private let root = FileManager.default.currentDirectoryPath
private let outputDirectory = root + "/release/marketing/reddit/2026-09-11"
private let screenshotDirectory = root + "/release/screenshots/raw/en-US"
private let iconPath = root + "/assets/icon.png"

private let white = NSColor(calibratedWhite: 0.98, alpha: 1)
private let muted = NSColor(calibratedWhite: 0.63, alpha: 1)
private let dark = NSColor(calibratedWhite: 0.025, alpha: 1)
private let panel = NSColor(calibratedWhite: 0.065, alpha: 1)
private let red = NSColor(calibratedRed: 1.0, green: 0.075, blue: 0.09, alpha: 1)
private var activeHeight = canvasHeight

private enum SlideKind {
    case program
    case stages
    case misses
    case offer
    case selfCommand
}

private struct Slide {
    let filename: String
    let kind: SlideKind
}

private let slides = [
    Slide(filename: "01-program-not-tracker.png", kind: .program),
    Slide(filename: "02-thirty-by-three.png", kind: .stages),
    Slide(filename: "03-missed-days-recorded.png", kind: .misses),
    Slide(filename: "04-price-privacy.png", kind: .offer),
    Slide(filename: "05-self-command.png", kind: .selfCommand),
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

private func drawImage(_ image: NSImage, destination: NSRect, source: NSRect? = nil) {
    image.draw(
        in: canvasRect(destination),
        from: source ?? NSRect(origin: .zero, size: image.size),
        operation: .sourceOver,
        fraction: 1,
        respectFlipped: false,
        hints: [.interpolation: NSImageInterpolation.high]
    )
}

private func topCrop(_ image: NSImage, x: CGFloat = 0, y: CGFloat, width: CGFloat, height: CGFloat) -> NSRect {
    NSRect(x: x, y: image.size.height - y - height, width: width, height: height)
}

private func fittedFont(_ text: String, max: CGFloat, min: CGFloat, width: CGFloat, weight: NSFont.Weight) -> NSFont {
    var size = max
    while size > min {
        let font = NSFont.systemFont(ofSize: size, weight: weight)
        if (text as NSString).size(withAttributes: [.font: font]).width <= width {
            return font
        }
        size -= 1
    }
    return NSFont.systemFont(ofSize: min, weight: weight)
}

private func drawText(
    _ text: String,
    rect: NSRect,
    font: NSFont,
    color: NSColor,
    alignment: NSTextAlignment = .left
) {
    let paragraph = NSMutableParagraphStyle()
    paragraph.lineBreakMode = .byWordWrapping
    paragraph.alignment = alignment
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

private func drawBackground() {
    fill(NSRect(x: 0, y: 0, width: canvasWidth, height: canvasHeight), color: dark)
    fill(NSRect(x: 0, y: 0, width: 12, height: canvasHeight), color: red)
    fill(NSRect(x: 12, y: 0, width: 1188, height: 3), color: red.withAlphaComponent(0.45))
    for index in 0..<7 {
        let y = 170 + CGFloat(index) * 205
        fill(NSRect(x: 0, y: y, width: canvasWidth, height: 1), color: white.withAlphaComponent(0.025))
    }
}

private func drawIdentity(icon: NSImage, index: Int, count: Int = 5) {
    let iconFrame = NSRect(x: 72, y: 48, width: 54, height: 54)
    NSGraphicsContext.saveGraphicsState()
    NSBezierPath(roundedRect: canvasRect(iconFrame), xRadius: 13, yRadius: 13).addClip()
    drawImage(icon, destination: iconFrame)
    NSGraphicsContext.restoreGraphicsState()

    drawText(
        "ALPHA",
        rect: NSRect(x: 148, y: 56, width: 240, height: 42),
        font: NSFont.systemFont(ofSize: 32, weight: .heavy),
        color: white
    )
    drawText(
        "90-DAY DISCIPLINE",
        rect: NSRect(x: 344, y: 61, width: 410, height: 32),
        font: NSFont.systemFont(ofSize: 20, weight: .bold),
        color: muted
    )
    drawText(
        String(format: "%02d / %02d", index, count),
        rect: NSRect(x: 965, y: 58, width: 165, height: 34),
        font: NSFont.monospacedDigitSystemFont(ofSize: 22, weight: .semibold),
        color: muted,
        alignment: .right
    )
}

private func drawHeadline(_ lines: [(String, NSColor)], y: CGFloat, maxSize: CGFloat = 76) -> CGFloat {
    var currentY = y
    for line in lines {
        let font = fittedFont(line.0, max: maxSize, min: 48, width: 1056, weight: .heavy)
        drawText(line.0, rect: NSRect(x: 72, y: currentY, width: 1056, height: maxSize + 18), font: font, color: line.1)
        currentY += maxSize + 5
    }
    return currentY
}

private func drawSubhead(_ text: String, y: CGFloat) {
    drawText(
        text,
        rect: NSRect(x: 75, y: y, width: 1050, height: 54),
        font: fittedFont(text, max: 30, min: 22, width: 1050, weight: .medium),
        color: muted
    )
}

private func drawScreenPanel(image: NSImage, source: NSRect, destination: NSRect, radius: CGFloat = 42) {
    fillRounded(
        NSRect(x: destination.minX + 16, y: destination.minY + 22, width: destination.width, height: destination.height),
        radius: radius,
        color: NSColor.black.withAlphaComponent(0.65)
    )
    NSGraphicsContext.saveGraphicsState()
    NSBezierPath(roundedRect: canvasRect(destination), xRadius: radius, yRadius: radius).addClip()
    drawImage(image, destination: destination, source: source)
    NSGraphicsContext.restoreGraphicsState()
    strokeRounded(destination, radius: radius, color: white.withAlphaComponent(0.16), lineWidth: 2)
    strokeRounded(destination, radius: radius, color: red.withAlphaComponent(0.28), lineWidth: 2)
}

private func drawPill(_ text: String, rect: NSRect, emphasized: Bool = false) {
    fillRounded(rect, radius: rect.height / 2, color: emphasized ? red : panel)
    strokeRounded(rect, radius: rect.height / 2, color: emphasized ? red : white.withAlphaComponent(0.16), lineWidth: 2)
    drawText(
        text,
        rect: NSRect(x: rect.minX + 24, y: rect.minY + 18, width: rect.width - 48, height: rect.height - 24),
        font: fittedFont(text, max: 28, min: 20, width: rect.width - 48, weight: .bold),
        color: white,
        alignment: .center
    )
}

private func render(_ slide: Slide, icon: NSImage, today: NSImage, course: NSImage, result: NSImage) -> NSBitmapImageRep {
    let (bitmap, context) = makeBitmap(width: canvasWidth, height: canvasHeight)
    begin(context, height: canvasHeight)
    drawBackground()

    switch slide.kind {
    case .program:
        drawIdentity(icon: icon, index: 1)
        let headlineBottom = drawHeadline([("A 90-DAY PROGRAM.", white), ("NOT ANOTHER HABIT SYSTEM.", red)], y: 135, maxSize: 69)
        drawSubhead("The routines are already decided. You do today's work.", y: headlineBottom + 4)
        drawScreenPanel(
            image: today,
            source: topCrop(today, y: 0, width: 1320, height: 1790),
            destination: NSRect(x: 200, y: 405, width: 800, height: 1085)
        )

    case .stages:
        drawIdentity(icon: icon, index: 2)
        let headlineBottom = drawHeadline([("30 DAYS × 3", white), ("BASIC → STANDARD → HARD", red)], y: 145, maxSize: 76)
        drawSubhead("One fixed path. The standard rises every 30 days.", y: headlineBottom + 4)
        drawScreenPanel(
            image: course,
            source: topCrop(course, y: 0, width: 1320, height: 1700),
            destination: NSRect(x: 185, y: 430, width: 830, height: 1069)
        )

    case .misses:
        drawIdentity(icon: icon, index: 3)
        let headlineBottom = drawHeadline([("MISSED DAYS", white), ("STAY ON THE RECORD.", red)], y: 145, maxSize: 78)
        drawSubhead("No perfect-streak theater. Close the day honestly.", y: headlineBottom + 4)
        drawScreenPanel(
            image: result,
            source: topCrop(result, y: 610, width: 1320, height: 1380),
            destination: NSRect(x: 105, y: 445, width: 990, height: 1035)
        )

    case .offer:
        drawIdentity(icon: icon, index: 4)
        let iconFrame = NSRect(x: 430, y: 190, width: 340, height: 340)
        NSGraphicsContext.saveGraphicsState()
        NSBezierPath(roundedRect: canvasRect(iconFrame), xRadius: 80, yRadius: 80).addClip()
        drawImage(icon, destination: iconFrame)
        NSGraphicsContext.restoreGraphicsState()
        strokeRounded(iconFrame, radius: 80, color: red.withAlphaComponent(0.5), lineWidth: 3)

        _ = drawHeadline([("PAY ONCE.", white), ("KEEP IT LOCAL.", red)], y: 585, maxSize: 88)
        drawPill("$2.99 ONCE", rect: NSRect(x: 145, y: 820, width: 430, height: 86), emphasized: true)
        drawPill("NO SUBSCRIPTION", rect: NSRect(x: 625, y: 820, width: 430, height: 86))
        drawPill("NO ACCOUNT", rect: NSRect(x: 145, y: 940, width: 430, height: 86))
        drawPill("DATA STAYS ON DEVICE", rect: NSRect(x: 625, y: 940, width: 430, height: 86))
        drawText(
            "AVAILABLE ON iOS AND ANDROID",
            rect: NSRect(x: 150, y: 1110, width: 900, height: 64),
            font: NSFont.systemFont(ofSize: 34, weight: .heavy),
            color: white,
            alignment: .center
        )
        drawText(
            "ALPHA — 90-Day Discipline",
            rect: NSRect(x: 150, y: 1195, width: 900, height: 58),
            font: NSFont.systemFont(ofSize: 28, weight: .medium),
            color: muted,
            alignment: .center
        )

    case .selfCommand:
        drawIdentity(icon: icon, index: 5)
        let headlineBottom = drawHeadline([("NOT ABOUT", white), ("DOMINATING OTHERS.", red)], y: 150, maxSize: 82)
        drawText(
            "ABOUT KEEPING PROMISES TO YOURSELF.",
            rect: NSRect(x: 74, y: headlineBottom + 22, width: 1050, height: 130),
            font: fittedFont("ABOUT KEEPING PROMISES TO YOURSELF.", max: 55, min: 42, width: 1050, weight: .heavy),
            color: white
        )
        drawScreenPanel(
            image: today,
            source: topCrop(today, y: 250, width: 1320, height: 900),
            destination: NSRect(x: 90, y: 600, width: 1020, height: 695)
        )
        drawText(
            "SELF-COMMAND, ONE CLOSED DAY AT A TIME.",
            rect: NSRect(x: 110, y: 1340, width: 980, height: 48),
            font: fittedFont("SELF-COMMAND, ONE CLOSED DAY AT A TIME.", max: 28, min: 21, width: 980, weight: .bold),
            color: muted,
            alignment: .center
        )
    }

    drawText(
        "EAST NOISE · 2026",
        rect: NSRect(x: 72, y: 1440, width: 1056, height: 32),
        font: NSFont.systemFont(ofSize: 17, weight: .semibold),
        color: muted.withAlphaComponent(0.75),
        alignment: .right
    )
    NSGraphicsContext.current = nil
    return bitmap
}

private func writePNG(_ bitmap: NSBitmapImageRep, path: String) throws {
    guard let data = bitmap.representation(using: .png, properties: [:]) else {
        throw NSError(domain: "ALPHAReddit", code: 1, userInfo: [NSLocalizedDescriptionKey: "PNG encoding failed"])
    }
    try data.write(to: URL(fileURLWithPath: path), options: .atomic)
}

private func writeJPEG(_ bitmap: NSBitmapImageRep, path: String, quality: CGFloat = 0.92) throws {
    guard let data = bitmap.representation(using: .jpeg, properties: [.compressionFactor: quality]) else {
        throw NSError(domain: "ALPHAReddit", code: 2, userInfo: [NSLocalizedDescriptionKey: "JPEG encoding failed"])
    }
    try data.write(to: URL(fileURLWithPath: path), options: .atomic)
}

private func renderContactSheet(files: [String]) throws {
    let sheetWidth: CGFloat = 1320
    let sheetHeight: CGFloat = 1260
    let previewWidth: CGFloat = 350
    let previewHeight: CGFloat = previewWidth * canvasHeight / canvasWidth
    let startX: CGFloat = 90
    let startY: CGFloat = 185
    let gapX: CGFloat = 45
    let gapY: CGFloat = 65
    let (bitmap, context) = makeBitmap(width: sheetWidth, height: sheetHeight)
    begin(context, height: sheetHeight)
    fill(NSRect(x: 0, y: 0, width: sheetWidth, height: sheetHeight), color: NSColor(calibratedWhite: 0.045, alpha: 1))
    drawText(
        "ALPHA · REDDIT LAUNCH ASSETS",
        rect: NSRect(x: 90, y: 58, width: 1140, height: 62),
        font: NSFont.systemFont(ofSize: 38, weight: .heavy),
        color: white
    )
    drawText(
        "4:5 · ACTUAL PRODUCT SCREENS · ENGLISH",
        rect: NSRect(x: 90, y: 120, width: 1140, height: 36),
        font: NSFont.systemFont(ofSize: 23, weight: .medium),
        color: muted
    )

    for (index, file) in files.enumerated() {
        guard let image = NSImage(contentsOfFile: outputDirectory + "/" + file) else { continue }
        let column = index % 3
        let row = index / 3
        let frame = NSRect(
            x: startX + CGFloat(column) * (previewWidth + gapX),
            y: startY + CGFloat(row) * (previewHeight + gapY),
            width: previewWidth,
            height: previewHeight
        )
        fillRounded(NSRect(x: frame.minX + 8, y: frame.minY + 12, width: frame.width, height: frame.height), radius: 20, color: NSColor.black.withAlphaComponent(0.6))
        NSGraphicsContext.saveGraphicsState()
        NSBezierPath(roundedRect: canvasRect(frame), xRadius: 20, yRadius: 20).addClip()
        drawImage(image, destination: frame)
        NSGraphicsContext.restoreGraphicsState()
        strokeRounded(frame, radius: 20, color: white.withAlphaComponent(0.12), lineWidth: 2)
    }
    NSGraphicsContext.current = nil
    try writeJPEG(bitmap, path: outputDirectory + "/contact-sheet.jpg")
}

guard
    let icon = NSImage(contentsOfFile: iconPath),
    let today = NSImage(contentsOfFile: screenshotDirectory + "/02-today.png"),
    let course = NSImage(contentsOfFile: screenshotDirectory + "/03-course.png"),
    let result = NSImage(contentsOfFile: screenshotDirectory + "/04-day-result.png")
else {
    fatalError("Missing ALPHA icon or English screenshots")
}

do {
    try FileManager.default.createDirectory(atPath: outputDirectory, withIntermediateDirectories: true)
    for slide in slides {
        let bitmap = render(slide, icon: icon, today: today, course: course, result: result)
        try writePNG(bitmap, path: outputDirectory + "/" + slide.filename)
    }
    try renderContactSheet(files: slides.map(\.filename))
    print("Rendered \(slides.count) Reddit assets and contact sheet to \(outputDirectory)")
} catch {
    fputs("Render failed: \(error)\n", stderr)
    exit(1)
}
