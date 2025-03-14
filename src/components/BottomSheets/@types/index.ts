export interface BottomSheetProps {
  close: () => void;
  snapToIndex: (index: number) => void;
  snapToPosition: (position: string) => void;
}

export type IndividualSheetName = keyof IndividualSheetProps;

export type IndividualSheetData<T extends IndividualSheetName> = {
  data: IndividualSheetProps[T];
};

export interface IndividualSheetProps {
  CREATE_API_KEY: undefined;
  NETWORK_LOGGER: undefined;
  DATA_SECURITY: undefined;
  DATA_REGION: undefined;
  SHARE_WITH_FRIENDS: undefined;
  CONFIGURE_ACTIVITY: undefined;
}
