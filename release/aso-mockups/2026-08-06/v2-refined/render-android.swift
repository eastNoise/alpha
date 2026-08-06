import AppKit

private let root = FileManager.default.currentDirectoryPath
private let sourceDirectory: String = {
    guard let argument = CommandLine.arguments.dropFirst().first else {
        return root + "/release/aso-mockups/2026-08-06/v2-refined"
    }
    return argument.hasPrefix("/") ? argument : root + "/" + argument
}()
private let outputDirectory = sourceDirectory + "/android"
private let sourceWidth: CGFloat = 1320
private let sourceHeight: CGFloat = 2868
private let targetHeight: CGFloat = 2640

private let files = [
    "01-visual-90days.jpg",
    "02-visual-life.jpg",
    "03-visual-reforge.jpg",
    "04-ui-today.jpg",
    "05-ui-records.jpg",
    "06-ui-course.jpg",
]

private func makeBitmap(width: CGFloat, height: CGFloat) -> NSBitmapImageRep {
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
    return bitmap
}

private func cropForGooglePlay(_ image: NSImage) -> NSBitmapImageRep {
    let bitmap = makeBitmap(width: sourceWidth, height: targetHeight)
    let context = NSGraphicsContext(bitmapImageRep: bitmap)!
    NSGraphicsContext.current = context
    context.shouldAntialias = true
    context.imageInterpolation = .high

    let source = NSRect(
        x: 0,
        y: sourceHeight - targetHeight,
        width: sourceWidth,
        height: targetHeight
    )
    image.draw(
        in: NSRect(x: 0, y: 0, width: sourceWidth, height: targetHeight),
        from: source,
        operation: .sourceOver,
        fraction: 1,
        respectFlipped: false,
        hints: [.interpolation: NSImageInterpolation.high]
    )
    NSGraphicsContext.current = nil
    return bitmap
}

private func writeJPEG(_ bitmap: NSBitmapImageRep, path: String, quality: CGFloat = 0.96) throws {
    guard let data = bitmap.representation(using: .jpeg, properties: [.compressionFactor: quality]) else {
        throw NSError(domain: "ALPHAAndroidScreenshots", code: 1, userInfo: [NSLocalizedDescriptionKey: "JPEG encoding failed"])
    }
    try data.write(to: URL(fileURLWithPath: path))
}

private func drawOverview() throws {
    let width: CGFloat = 1280
    let height: CGFloat = 1760
    let itemWidth: CGFloat = 350
    let itemHeight = itemWidth * targetHeight / sourceWidth
    let startX: CGFloat = 65
    let startY: CGFloat = 145
    let gapX: CGFloat = 50
    let gapY: CGFloat = 90
    let bitmap = makeBitmap(width: width, height: height)
    let context = NSGraphicsContext(bitmapImageRep: bitmap)!
    NSGraphicsContext.current = context
    context.shouldAntialias = true
    context.imageInterpolation = .high

    NSColor(calibratedWhite: 0.07, alpha: 1).setFill()
    NSBezierPath(rect: NSRect(x: 0, y: 0, width: width, height: height)).fill()

    let title = "ALPHA · GOOGLE PLAY" as NSString
    title.draw(
        at: NSPoint(x: 65, y: height - 92),
        withAttributes: [
            .font: NSFont.systemFont(ofSize: 34, weight: .bold),
            .foregroundColor: NSColor.white,
        ]
    )

    for (index, filename) in files.enumerated() {
        guard let image = NSImage(contentsOfFile: outputDirectory + "/" + filename) else { continue }
        let column = index % 3
        let row = index / 3
        let topY = startY + CGFloat(row) * (itemHeight + gapY)
        let frame = NSRect(
            x: startX + CGFloat(column) * (itemWidth + gapX),
            y: height - topY - itemHeight,
            width: itemWidth,
            height: itemHeight
        )
        NSGraphicsContext.saveGraphicsState()
        NSBezierPath(roundedRect: frame, xRadius: 16, yRadius: 16).addClip()
        image.draw(in: frame, from: NSRect(origin: .zero, size: image.size), operation: .sourceOver, fraction: 1)
        NSGraphicsContext.restoreGraphicsState()
    }
    NSGraphicsContext.current = nil
    try writeJPEG(bitmap, path: outputDirectory + "/overview-6up.jpg", quality: 0.94)
}

do {
    try FileManager.default.createDirectory(atPath: outputDirectory, withIntermediateDirectories: true)
    for filename in files {
        guard let image = NSImage(contentsOfFile: sourceDirectory + "/" + filename) else {
            throw NSError(domain: "ALPHAAndroidScreenshots", code: 2, userInfo: [NSLocalizedDescriptionKey: "Missing \(filename)"])
        }
        let bitmap = cropForGooglePlay(image)
        try writeJPEG(bitmap, path: outputDirectory + "/" + filename)
    }
    try drawOverview()
    print("Rendered \(files.count) Google Play screenshots to \(outputDirectory)")
} catch {
    fputs("Render failed: \(error)\n", stderr)
    exit(1)
}
