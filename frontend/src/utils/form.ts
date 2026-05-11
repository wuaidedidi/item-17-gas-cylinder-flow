import dayjs, { Dayjs } from 'dayjs';

export const cleanPayload = (values: Record<string, any>) =>
  Object.fromEntries(
    Object.entries(values).map(([key, value]) => {
      if (value === '') return [key, null];
      if (dayjs.isDayjs(value)) return [key, (value as Dayjs).toISOString()];
      return [key, value];
    }),
  );

