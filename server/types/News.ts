export default interface News {
  id?: string;
  title: string;
  message: string;
  icon: string;
  from: string;
  till: string;
  meta?: object;
}
