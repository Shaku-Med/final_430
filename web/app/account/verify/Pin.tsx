import {
    InputOTP,
    InputOTPGroup,
    InputOTPSeparator,
    InputOTPSlot,
  } from "@/components/ui/input-otp";
  
  interface PinProps {
    className?: string;
    length?: number;
    onComplete?: (value: string) => void;
  }
  
  const Pin = ({ className, length = 6, onComplete }: PinProps) => {
    const firstHalfLength = Math.ceil(length / 2);
    const secondHalfLength = length - firstHalfLength;
  
    const firstHalfSlots = Array.from({ length: firstHalfLength }, (_, i) => (
      <InputOTPSlot key={i} inputMode="tel" index={i} />
    ));
  
    const secondHalfSlots = Array.from({ length: secondHalfLength }, (_, i) => (
      <InputOTPSlot key={i + firstHalfLength} inputMode="tel" index={i + firstHalfLength} />
    ));
  
    return (
      <div className="flex justify-center w-full mb-4">
        <InputOTP
        autoFocus
          maxLength={length}
          onChange={(value) => {
            if (value.length === length && onComplete) {
              onComplete(value);
            }
          }}
        >
          <InputOTPGroup>
            {firstHalfSlots}
          </InputOTPGroup>
          {secondHalfLength > 0 && (
            <>
              <InputOTPSeparator />
              <InputOTPGroup>
                {secondHalfSlots}
              </InputOTPGroup>
            </>
          )}
        </InputOTP>
      </div>
    );
  };
  
  export default Pin;