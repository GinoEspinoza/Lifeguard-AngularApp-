import * as moment from 'moment';

export = moment;

declare module 'moment' {
  interface Moment {
    preciseDiff(start: string | Date | moment.Moment): string;
  }
}