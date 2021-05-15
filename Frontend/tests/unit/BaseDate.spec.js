import { mount } from "@vue/test-utils";
import BaseDate from "@/components/BaseDate";

test("Takes a timestamp and a configuration parameter and renders a date", () => {
  const timestamp = 1621088955000;
  const dateFormat = "dd.MM.yyyy";
  const wrapper = mount(BaseDate, { props: { timestamp, dateFormat } });

  expect(wrapper.text()).toBe("15.05.2021");
});

test("Should use a default dateFormat if none is passed", () => {
  const timestamp = 1621088955000;
  const wrapper = mount(BaseDate, { props: { timestamp } });

  expect(wrapper.text()).toBe("15.05.2021");
});
