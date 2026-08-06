import AppKit

private let slideWidth: CGFloat = 1320
private let canvasWidth: CGFloat = slideWidth * 3
private let canvasHeight: CGFloat = 2868
private let root = FileManager.default.currentDirectoryPath
private let outputDirectory = root + "/release/aso-mockups/2026-08-06/v2-refined/en-US"
private let v2Directory = root + "/release/aso-mockups/2026-08-06/v2"
private let rawDirectory = root + "/release/screenshots/raw/en-US"

private let white = NSColor(calibratedWhite: 0.97, alpha: 1)
private let gray = NSColor(calibratedWhite: 0.67, alpha: 1)
private let red = NSColor(calibratedRed: 0.98, green: 0.075, blue: 0.095, alpha: 1)
private var activeCanvasHeight: CGFloat = canvasHeight

private struct Crop {
    let x: CGFloat
    let y: CGFloat
    let width: CGFloat
    let height: CGFloat
}

private struct Headline {
    let lines: [(String, NSColor)]
    let supportingText: String
}

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

private func beginContext(_ context: NSGraphicsContext, height: CGFloat) {
    NSGraphicsContext.current = context
    activeCanvasHeight = height
    context.shouldAntialias = true
    context.imageInterpolation = .high
}

private func canvasRect(_ rect: NSRect) -> NSRect {
    NSRect(x: rect.minX, y: activeCanvasHeight - rect.maxY, width: rect.width, height: rect.height)
}

private func fill(_ rect: NSRect, color: NSColor) {
    color.setFill()
    NSBezierPath(rect: canvasRect(rect)).fill()
}

private func fillRounded(_ rect: NSRect, radius: CGFloat, color: NSColor) {
    color.setFill()
    NSBezierPath(roundedRect: canvasRect(rect), xRadius: radius, yRadius: radius).fill()
}

private func strokeRounded(_ rect: NSRect, radius: CGFloat, color: NSColor, width: CGFloat) {
    color.setStroke()
    let path = NSBezierPath(roundedRect: canvasRect(rect), xRadius: radius, yRadius: radius)
    path.lineWidth = width
    path.stroke()
}

private func drawText(_ text: String, rect: NSRect, font: NSFont, color: NSColor) {
    let paragraph = NSMutableParagraphStyle()
    paragraph.lineBreakMode = .byWordWrapping
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

private func fittedHeavyFont(text: String, maximum: CGFloat, minimum: CGFloat, width: CGFloat) -> NSFont {
    var size = maximum
    while size > minimum {
        let font = NSFont.systemFont(ofSize: size, weight: .heavy)
        if (text as NSString).size(withAttributes: [.font: font]).width <= width {
            return font
        }
        size -= 2
    }
    return NSFont.systemFont(ofSize: minimum, weight: .heavy)
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

private func drawIdentity(x: CGFloat, icon: NSImage) {
    let iconFrame = NSRect(x: x + 82, y: 64, width: 62, height: 62)
    NSGraphicsContext.saveGraphicsState()
    NSBezierPath(roundedRect: canvasRect(iconFrame), xRadius: 15, yRadius: 15).addClip()
    drawImage(icon, destination: iconFrame)
    NSGraphicsContext.restoreGraphicsState()

    drawText(
        "ALPHA",
        rect: NSRect(x: x + 166, y: 72, width: 320, height: 48),
        font: NSFont.systemFont(ofSize: 36, weight: .bold),
        color: white
    )
}

@discardableResult
private func drawPanel(
    image: NSImage,
    crop: Crop,
    x: CGFloat,
    y: CGFloat,
    width: CGFloat,
    radius: CGFloat = 34
) -> CGFloat {
    let height = width * crop.height / crop.width
    let destination = NSRect(x: x, y: y, width: width, height: height)
    let source = NSRect(
        x: crop.x,
        y: image.size.height - crop.y - crop.height,
        width: crop.width,
        height: crop.height
    )

    fillRounded(
        NSRect(x: x + 12, y: y + 18, width: width, height: height),
        radius: radius,
        color: NSColor.black.withAlphaComponent(0.4)
    )

    NSGraphicsContext.saveGraphicsState()
    NSBezierPath(roundedRect: canvasRect(destination), xRadius: radius, yRadius: radius).addClip()
    drawImage(image, destination: destination, source: source)
    NSGraphicsContext.restoreGraphicsState()
    strokeRounded(destination, radius: radius, color: NSColor.white.withAlphaComponent(0.16), width: 2)
    return height
}

private func renderBrandPanorama(background: NSImage, icon: NSImage) throws -> NSBitmapImageRep {
    let (bitmap, context) = makeBitmap(width: canvasWidth, height: canvasHeight)
    beginContext(context, height: canvasHeight)
    fill(NSRect(x: 0, y: 0, width: canvasWidth, height: canvasHeight), color: .black)

    // A tighter crop keeps the three people and staircase connected while reducing empty sky.
    drawImage(background, destination: NSRect(x: -230, y: -350, width: 4420, height: 3204))
    fill(NSRect(x: 0, y: 0, width: canvasWidth, height: 760), color: NSColor.black.withAlphaComponent(0.22))

    let headlines = [
        Headline(lines: [("90 DAYS", white)], supportingText: "Self-discipline starts with repetition, not motivation."),
        Headline(lines: [("TO REBUILD", white)], supportingText: "Hold every day to the same standard."),
        Headline(lines: [("YOUR LIFE.", red)], supportingText: "BASIC · STANDARD · HARD. Three stages. 90 days."),
    ]

    for (index, headline) in headlines.enumerated() {
        let offset = CGFloat(index) * slideWidth
        drawIdentity(x: offset, icon: icon)
        let title = headline.lines[0]
        drawText(
            title.0,
            rect: NSRect(x: offset + 82, y: 245, width: 1156, height: 205),
            font: fittedHeavyFont(text: title.0, maximum: 164, minimum: 130, width: 1156),
            color: title.1
        )
        drawText(
            headline.supportingText,
            rect: NSRect(x: offset + 86, y: 458, width: 1120, height: 66),
            font: NSFont.systemFont(ofSize: 38, weight: .medium),
            color: gray
        )
        fill(NSRect(x: offset + 86, y: 552, width: 92, height: 8), color: red)
    }

    NSGraphicsContext.current = nil
    return bitmap
}

private func drawProductHeadline(_ headline: Headline, offset: CGFloat, icon: NSImage) {
    drawIdentity(x: offset, icon: icon)
    for (index, line) in headline.lines.enumerated() {
        drawText(
            line.0,
            rect: NSRect(x: offset + 82, y: 205 + CGFloat(index) * 118, width: 1156, height: 132),
            font: fittedHeavyFont(text: line.0, maximum: 112, minimum: 92, width: 1156),
            color: line.1
        )
    }
    drawText(
        headline.supportingText,
        rect: NSRect(x: offset + 84, y: 478, width: 1140, height: 62),
        font: NSFont.systemFont(ofSize: 37, weight: .medium),
        color: gray
    )
    fill(NSRect(x: offset + 84, y: 580, width: 92, height: 8), color: red)
}

private func renderProductPanorama(
    background: NSImage,
    icon: NSImage,
    today: NSImage,
    records: NSImage,
    course: NSImage
) throws -> NSBitmapImageRep {
    let (bitmap, context) = makeBitmap(width: canvasWidth, height: canvasHeight)
    beginContext(context, height: canvasHeight)
    fill(NSRect(x: 0, y: 0, width: canvasWidth, height: canvasHeight), color: .black)
    drawImage(background, destination: NSRect(x: 0, y: 0, width: canvasWidth, height: canvasHeight))
    fill(NSRect(x: 0, y: 0, width: canvasWidth, height: canvasHeight), color: NSColor.black.withAlphaComponent(0.12))

    let headlines = [
        Headline(lines: [("CLOSE THE", white), ("DAY.", red)], supportingText: "Check it. Do it. Close the day."),
        Headline(lines: [("RECORD EVERY", red), ("FAILURE.", white)], supportingText: "Win or fail, every day stays on record."),
        Headline(lines: [("RAISE THE", white), ("STANDARD.", red)], supportingText: "From BASIC to HARD, one 30-day course at a time."),
    ]

    for (index, headline) in headlines.enumerated() {
        drawProductHeadline(headline, offset: CGFloat(index) * slideWidth, icon: icon)
    }

    let x4: CGFloat = 80
    _ = drawPanel(image: today, crop: Crop(x: 45, y: 350, width: 1230, height: 450), x: x4, y: 650, width: 1160)
    _ = drawPanel(image: today, crop: Crop(x: 45, y: 850, width: 1230, height: 330), x: x4, y: 1110, width: 1160)
    _ = drawPanel(image: today, crop: Crop(x: 45, y: 1170, width: 1230, height: 700), x: x4, y: 1465, width: 1160)
    _ = drawPanel(image: today, crop: Crop(x: 45, y: 1910, width: 1230, height: 200), x: x4, y: 2165, width: 1160)

    let x5: CGFloat = slideWidth + 120
    _ = drawPanel(image: records, crop: Crop(x: 45, y: 350, width: 1230, height: 340), x: x5, y: 650, width: 1080)
    _ = drawPanel(image: records, crop: Crop(x: 45, y: 730, width: 1230, height: 470), x: x5, y: 990, width: 1080)
    _ = drawPanel(image: records, crop: Crop(x: 45, y: 1280, width: 1230, height: 570), x: x5, y: 1445, width: 1080)
    _ = drawPanel(image: records, crop: Crop(x: 45, y: 1900, width: 1230, height: 300), x: x5, y: 1985, width: 1080)

    let x6: CGFloat = slideWidth * 2 + 80
    _ = drawPanel(image: course, crop: Crop(x: 45, y: 350, width: 1230, height: 520), x: x6, y: 650, width: 1160)
    _ = drawPanel(image: course, crop: Crop(x: 45, y: 930, width: 1230, height: 650), x: x6, y: 1180, width: 1160)
    _ = drawPanel(image: course, crop: Crop(x: 45, y: 1580, width: 1230, height: 770), x: x6, y: 1835, width: 1160)

    NSGraphicsContext.current = nil
    return bitmap
}

private func writeJPEG(_ bitmap: NSBitmapImageRep, path: String, quality: CGFloat = 0.96) throws {
    guard let data = bitmap.representation(using: .jpeg, properties: [.compressionFactor: quality]) else {
        throw NSError(domain: "ALPHAV2Refined", code: 1, userInfo: [NSLocalizedDescriptionKey: "JPEG encoding failed"])
    }
    try data.write(to: URL(fileURLWithPath: path))
}

private func splitPanorama(_ bitmap: NSBitmapImageRep, filenames: [String]) throws {
    guard let image = bitmap.cgImage else {
        throw NSError(domain: "ALPHAV2Refined", code: 2, userInfo: [NSLocalizedDescriptionKey: "Missing panorama image"])
    }
    for (index, filename) in filenames.enumerated() {
        let crop = CGRect(x: CGFloat(index) * slideWidth, y: 0, width: slideWidth, height: canvasHeight)
        guard let slice = image.cropping(to: crop) else { continue }
        let rep = NSBitmapImageRep(cgImage: slice)
        rep.size = NSSize(width: slideWidth, height: canvasHeight)
        try writeJPEG(rep, path: outputDirectory + "/" + filename)
    }
}

private func drawOverview(files: [String]) throws {
    let width: CGFloat = 1280
    let height: CGFloat = 1880
    let itemWidth: CGFloat = 350
    let itemHeight = itemWidth * canvasHeight / slideWidth
    let gapX: CGFloat = 50
    let gapY: CGFloat = 88
    let startX: CGFloat = 65
    let startY: CGFloat = 150
    let (bitmap, context) = makeBitmap(width: width, height: height)
    beginContext(context, height: height)
    fill(NSRect(x: 0, y: 0, width: width, height: height), color: NSColor(calibratedWhite: 0.07, alpha: 1))
    drawText(
        "ALPHA · ENGLISH · V2 REFINED",
        rect: NSRect(x: 65, y: 55, width: 760, height: 58),
        font: NSFont.systemFont(ofSize: 34, weight: .bold),
        color: white
    )

    for (index, filename) in files.enumerated() {
        guard let image = NSImage(contentsOfFile: outputDirectory + "/" + filename) else { continue }
        let column = index % 3
        let row = index / 3
        let frame = NSRect(
            x: startX + CGFloat(column) * (itemWidth + gapX),
            y: startY + CGFloat(row) * (itemHeight + gapY),
            width: itemWidth,
            height: itemHeight
        )
        fillRounded(NSRect(x: frame.minX + 12, y: frame.minY + 18, width: frame.width, height: frame.height), radius: 16, color: NSColor.black.withAlphaComponent(0.45))
        NSGraphicsContext.saveGraphicsState()
        NSBezierPath(roundedRect: canvasRect(frame), xRadius: 16, yRadius: 16).addClip()
        drawImage(image, destination: frame)
        NSGraphicsContext.restoreGraphicsState()
    }
    NSGraphicsContext.current = nil
    try writeJPEG(bitmap, path: outputDirectory + "/overview-6up.jpg", quality: 0.94)
}

private func drawComparison() throws {
    let width: CGFloat = 1640
    let height: CGFloat = 1320
    let itemWidth: CGFloat = 760
    let itemHeight = itemWidth * canvasHeight / canvasWidth
    let (bitmap, context) = makeBitmap(width: width, height: height)
    beginContext(context, height: height)
    fill(NSRect(x: 0, y: 0, width: width, height: height), color: NSColor(calibratedWhite: 0.07, alpha: 1))

    let items = [
        ("V2", v2Directory + "/brand-connected-3up.jpg", 50.0, 115.0),
        ("V2 REFINED", outputDirectory + "/brand-connected-3up.jpg", 830.0, 115.0),
        ("V2", v2Directory + "/product-components-3up.jpg", 50.0, 735.0),
        ("V2 REFINED", outputDirectory + "/product-components-3up.jpg", 830.0, 735.0),
    ]

    for item in items {
        drawText(item.0, rect: NSRect(x: item.2, y: item.3 - 55, width: 500, height: 40), font: NSFont.systemFont(ofSize: 28, weight: .bold), color: white)
        guard let image = NSImage(contentsOfFile: item.1) else { continue }
        drawImage(image, destination: NSRect(x: item.2, y: item.3, width: itemWidth, height: itemHeight))
    }
    NSGraphicsContext.current = nil
    try writeJPEG(bitmap, path: outputDirectory + "/comparison-v2-vs-refined.jpg", quality: 0.94)
}

let requiredImages = [
    v2Directory + "/brand-background-source.png",
    v2Directory + "/product-background-source.png",
    root + "/release/google-play/assets/app-icon-512.png",
    rawDirectory + "/02-today.png",
    outputDirectory + "/sources/05-records.jpg",
    rawDirectory + "/03-course.png",
]

let loaded = requiredImages.compactMap { NSImage(contentsOfFile: $0) }
guard loaded.count == requiredImages.count else {
    fatalError("A required source image is missing")
}

do {
    try FileManager.default.createDirectory(atPath: outputDirectory, withIntermediateDirectories: true)
    let brand = try renderBrandPanorama(background: loaded[0], icon: loaded[2])
    let product = try renderProductPanorama(
        background: loaded[1],
        icon: loaded[2],
        today: loaded[3],
        records: loaded[4],
        course: loaded[5]
    )

    try writeJPEG(brand, path: outputDirectory + "/brand-connected-3up.jpg")
    try writeJPEG(product, path: outputDirectory + "/product-components-3up.jpg")
    let files = [
        "01-visual-90days.jpg",
        "02-visual-life.jpg",
        "03-visual-reforge.jpg",
        "04-ui-today.jpg",
        "05-ui-records.jpg",
        "06-ui-course.jpg",
    ]
    try splitPanorama(brand, filenames: Array(files.prefix(3)))
    try splitPanorama(product, filenames: Array(files.suffix(3)))
    try drawOverview(files: files)
    print("Rendered English V2 refined assets to \(outputDirectory)")
} catch {
    fputs("Render failed: \(error)\n", stderr)
    exit(1)
}
