import { goBack } from '@/components/ui/Header';
import { VoiceAssistant } from '@/features/voice/VoiceAssistant';

/** Full-screen assistant opened from the owner dashboard quick action. */
export default function VoiceModal() {
  return <VoiceAssistant variant="modal" onClose={() => goBack('/owner')} />;
}
