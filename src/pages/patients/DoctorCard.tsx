import { Checkbox, Link, User, Chip, cn } from "@nextui-org/react";

interface UserProps {
  name: string;
  avatar: string;
  url: string;
  username: string;
  role: string;
  status: string;
}

export const CustomCheckbox = ({
  user,
  statusColor,
  value,
}: {
  user: UserProps;
  statusColor: string;
  value: string;
}) => {
  return (
    <Checkbox
      aria-label={user.name}
      classNames={{
        base: cn(
          "inline-flex max-w-[310px] w-full bg-content1 m-0",
          "hover:bg-content2 items-center justify-start",
          "cursor-pointer rounded-lg gap-2 p-4 border-2 border-transparent",
          "data-[selected=true]:border-success"
        ),
        label: "w-full",
      }}
      value={value}
    >
      <div className="w-full flex justify-between gap-2">
        <User
          avatarProps={{ size: "md", src: user.avatar }}
          description={
            <span className="text-tiny text-default-500">{user.role}</span>
          }
          name={user.name}
        />
        <div className="flex flex-col items-end gap-1">
          
          <Chip
            color={
              statusColor as
                | "default"
                | "primary"
                | "secondary"
                | "success"
                | "warning"
                | "danger"
            }
            size="sm"
            variant="flat"
          >
            {user.status}
          </Chip>
        </div>
      </div>
    </Checkbox>
  );
};
