import { mount } from "@vue/test-utils";
import BaseDate from "@/components/BaseDate";

test("Takes a timestamp and a configuration parameter and renders a date", () => {
  const timestamp = 1621088955000;
  const dateFormat = "dd.MM.yyyy";
  const wrapper = mount(BaseDate, { props: { timestamp, dateFormat } });

  expect(wrapper.html()).toMatchSnapshot();
});

test("Use a default date format if none is passed", () => {
  const timestamp = 1621088955000;
  const wrapper = mount(BaseDate, { props: { timestamp } });

  expect(wrapper.html()).toMatchSnapshot();
});

test("Do not render if no timestamp prop is passed", () => {
  const timestamp = null;
  const wrapper = mount(BaseDate, { props: { timestamp } });

  expect(wrapper.html()).toMatchSnapshot();
});
