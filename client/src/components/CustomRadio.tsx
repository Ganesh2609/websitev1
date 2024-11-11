
import {

  useRadio,
  VisuallyHidden,
  RadioProps,
  cn,
  Chip,
  tv
} from "@nextui-org/react";
import { Check } from "lucide-react";

const checkbox = tv({
    slots: {
      base: "border-default hover:bg-default-200 min-w-[101px] flex content-evenly px-4",
      content: "text-default-500"
    },
    variants: {
      isSelected: {
        true: {
          base: "border-primary bg-primary hover:bg-primary-500 hover:border-primary-500 px-3",
          content: "text-primary-foreground pl-1"  
        }
      },
      isFocusVisible: {
        true: { 
          base: "outline-none ring-2 ring-focus ring-offset-2 ring-offset-background",
        }
      }
    }
  });

export const CustomRadio = (props: RadioProps) => {
  const {
    Component,
    children,
    isSelected,
    isDisabled,
    isFocusVisible,
    getBaseProps,
    getInputProps,
  } = useRadio(props);
  const styles = checkbox({ isSelected, isFocusVisible });
  return (
    <Component
      {...getBaseProps()}
      className={cn(

      )}
    >
      <VisuallyHidden>
        <input {...getInputProps()} />
      </VisuallyHidden>
      <Chip
        classNames={{
          base: styles.base(),
          content: styles.content(),
        }}
        color="primary"
        startContent={isSelected ? <Check color="white" size={15}/> : null}
        variant="faded"     
        isDisabled={isDisabled}
        // {...getLabelProps()}
      >
        {children ? children : isSelected ? "Enabled" : "Disabled"}
      </Chip>
    </Component>
  );
};
