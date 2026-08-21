import { NativeModule, requireOptionalNativeModule } from 'expo';

declare class AlphaHapticsModule extends NativeModule {
  playPatternAsync(pattern: string): Promise<boolean>;
}

export default requireOptionalNativeModule<AlphaHapticsModule>('AlphaHaptics');
