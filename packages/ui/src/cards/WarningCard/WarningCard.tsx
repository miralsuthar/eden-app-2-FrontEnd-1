import { BatteryStepper, Button, Card } from "@eden/package-ui";
import { ExclamationIcon } from "@heroicons/react/solid";
import { FaCheck } from "react-icons/fa";
import { ImCross } from "react-icons/im";

export interface WarningCardProps {
  profilePercentage?: number | null | undefined;
  onClickCompleteProfile?: () => void;
  text1?: string;
  text2?: string;
}

export const WarningCard = ({
  // eslint-disable-next-line no-unused-vars
  profilePercentage = null,
  onClickCompleteProfile,
  text1 = "You can see projects",
  text2 = "Projects can't see you",
}: WarningCardProps) => {
  return (
    <Card
      shadow
      className="w-full flex-grow border-[2px] bg-white p-10 font-semibold"
    >
      <div className="flex flex-col content-center items-center justify-center justify-items-center tracking-wide">
        {profilePercentage !== null && (
          <div className="absolute right-4 top-4">
            <BatteryStepper
              size="sm"
              showPercentage
              batteryPercentage={profilePercentage || 0}
            />
          </div>
        )}
        <div className="mt-3">
          <ExclamationIcon color="#ff9c59" width={100} />
        </div>
        <div className="justify-center pb-10">
          <div className="mt-auto mb-2 flex items-center justify-start pt-5 pb-2">
            <div className="mr-6">
              <FaCheck size={32} color={"#74FA6D"} />
            </div>
            <p className="text-lg">{text1}</p>
          </div>
          <div className="mt-auto flex w-full items-center justify-start pb-2">
            <div className="mr-6">
              <ImCross size={32} color={"FF7E5C"} />
            </div>
            <div>
              <p className="text-lg">{text2}</p>
            </div>
          </div>
        </div>
        <div className="mt-3">
          <Button
            variant="primary"
            radius="default"
            size="md"
            onClick={onClickCompleteProfile}
          >
            Finish your profile
          </Button>
        </div>
      </div>
    </Card>
  );
};
