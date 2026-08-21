Pod::Spec.new do |s|
  s.name           = 'AlphaHaptics'
  s.version        = '1.0.0'
  s.summary        = 'Native haptic patterns for ALPHA'
  s.description    = 'Core Haptics patterns used by the ALPHA app.'
  s.author         = 'East Noise'
  s.homepage       = 'https://github.com/eastNoise/alpha'
  s.platforms      = {
    :ios => '15.1',
    :tvos => '15.1'
  }
  s.source         = { git: 'https://github.com/eastNoise/alpha.git' }
  s.static_framework = true

  s.dependency 'ExpoModulesCore'

  # Swift/Objective-C compatibility
  s.pod_target_xcconfig = {
    'DEFINES_MODULE' => 'YES',
  }

  s.source_files = "**/*.{h,m,mm,swift,hpp,cpp}"
end
