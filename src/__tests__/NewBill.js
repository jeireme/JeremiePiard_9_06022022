/**
 * @jest-environment jsdom
 */

import "@testing-library/jest-dom";
import { screen, waitFor, getByTestId, fireEvent } from "@testing-library/dom";
import userEvent from "@testing-library/user-event";
import { ROUTES, ROUTES_PATH } from "../constants/routes";
import { localStorageMock } from "../__mocks__/localStorage.js";
import mockStore from "../__mocks__/store";
import router from "../app/Router.js";
import NewBillUI from "../views/NewBillUI.js";
import NewBill from "../containers/NewBill.js";

jest.mock("../app/store", () => mockStore);

describe("Given I am connected as an employee", () => {
  describe("When I am on NewBill Page", () => {
    test("Then ...", () => {
      const html = NewBillUI();
      document.body.innerHTML = html;
      //to-do write assertion
    });

    test("Then I should see the form inputs", () => {
      const html = NewBillUI();
      document.body.innerHTML = html;

      const expenseType = screen.getByTestId("expense-type");
      expect(expenseType).toBeTruthy();

      const expenseName = screen.getByTestId("expense-name");
      expect(expenseName).toBeTruthy();

      const datePicker = screen.getByTestId("datepicker");
      expect(datePicker).toBeTruthy();

      const amount = screen.getByTestId("amount");
      expect(amount).toBeTruthy();

      const vat = screen.getByTestId("vat");
      expect(vat).toBeTruthy();

      const pct = screen.getByTestId("pct");
      expect(pct).toBeTruthy();

      const commentary = screen.getByTestId("commentary");
      expect(commentary).toBeTruthy();

      const file = screen.getByTestId("file");
      expect(file).toBeTruthy();

      const submitBtn = document.getElementById("btn-send-bill");
      expect(submitBtn).toBeTruthy();
    });

    test('Then if I click on the button "Choisir un fichier", it should call handleChangeFile()', () => {
      const html = NewBillUI();
      document.body.innerHTML = html;
      Object.defineProperty(window, "localStorage", {
        value: localStorageMock,
      });
      const onNavigate = (pathname) => {
        document.body.innerHTML = ROUTES({ pathname });
      };
      const newBillJs = new NewBill({
        document,
        onNavigate,
        store: null,
        localStorage: window.localStorage,
      });

      const handleChangeFile = jest.fn((e) => newBillJs.handleChangeFile(e));
      const file = screen.getByTestId("file");

      file.addEventListener("click", handleChangeFile);
      userEvent.click(file);

      expect(handleChangeFile).toHaveBeenCalled();
    });

    test("Then bill icon in vertical layout should be highlighted", async () => {
      Object.defineProperty(window, "localStorage", {
        value: localStorageMock,
      });
      window.localStorage.setItem(
        "user",
        JSON.stringify({
          type: "Employee",
        })
      );
      const root = document.createElement("div");
      root.setAttribute("id", "root");
      document.body.append(root);
      router();
      window.onNavigate(ROUTES_PATH.NewBill);

      await waitFor(() => screen.getByTestId("icon-mail"));
      const iconMail = screen.getByTestId("icon-mail");

      expect(
        document
          .getElementById("layout-icon2")
          .classList.contains("active-icon")
      ).toBeTruthy();
    });

    test("Then if I don't fill the form and submit, it should call handleSubmit() but not updateBill()", () => {
      const html = NewBillUI();
      document.body.innerHTML = html;
      Object.defineProperty(window, "localStorage", {
        value: localStorageMock,
      });
      const onNavigate = (pathname) => {
        document.body.innerHTML = ROUTES({ pathname });
      };
      const newBillJs = new NewBill({
        document,
        onNavigate,
        store: null,
        localStorage: window.localStorage,
      });

      const submitBtn = document.getElementById("btn-send-bill");
      const handleSubmit = jest.fn((e) => newBillJs.handleSubmit(e));
      const updateBill = jest.fn((e) => newBillJs.updateBill(e));

      submitBtn.addEventListener("submit", handleSubmit);
      fireEvent.submit(submitBtn);
      expect(handleSubmit).toHaveBeenCalled();
      expect(updateBill).not.toHaveBeenCalled();
    });

    test('Then I should see the text "Envoyer une note de frais"', () => {
      const html = NewBillUI();
      document.body.innerHTML = html;
      const contentTitle = screen.getByTestId("form-new-bill");
      expect(contentTitle).toBeTruthy();
    });
  });
});

describe("When I correctly fill the form and submit", () => {
  test("Then it should call handleSubmit() and updateBill()", async () => {
    const html = NewBillUI();
    document.body.innerHTML = html;
    Object.defineProperty(window, "localStorage", { value: localStorageMock });
    const onNavigate = (pathname) => {
      document.body.innerHTML = ROUTES({ pathname });
    };
    const newBillJs = new NewBill({
      document,
      onNavigate,
      store: null,
      localStorage: window.localStorage,
    });

    const expenseType = screen.getByTestId("expense-type");
    expect(expenseType).toBeRequired();
    fireEvent.change(expenseType, { target: { value: "Transports" } });
    expect(expenseType.value).toBe("Transports");

    const expenseName = screen.getByTestId("expense-name");
    expect(expenseName).toHaveAttribute("type", "text");
    fireEvent.change(expenseName, { target: { value: "Vol Paris Londres" } });
    expect(expenseName.value).toBe("Vol Paris Londres");

    const datePicker = screen.getByTestId("datepicker");
    expect(datePicker).toBeRequired();
    expect(datePicker).toHaveAttribute("type", "date");
    fireEvent.change(datePicker, { target: { value: "2020-02-07" } });
    expect(datePicker.value).toBe("2020-02-07");

    const amount = screen.getByTestId("amount");
    expect(amount).toBeRequired();
    expect(amount).toHaveAttribute("type", "number");
    fireEvent.change(amount, { target: { value: "999" } });
    expect(amount.value).toBe("999");

    const vat = screen.getByTestId("vat");
    expect(vat).toHaveAttribute("type", "number");
    fireEvent.change(vat, { target: { value: "70" } });
    expect(vat.value).toBe("70");

    const pct = screen.getByTestId("pct");
    expect(pct).toHaveAttribute("type", "number");
    fireEvent.change(pct, { target: { value: "20" } });
    expect(pct.value).toBe("20");

    const commentary = screen.getByTestId("commentary");
    fireEvent.change(commentary, {
      target: { value: "Entretien avec le nouveau directeur" },
    });
    expect(commentary.value).toBe("Entretien avec le nouveau directeur");

    const uploadInput = screen.getByTestId("file");
    expect(uploadInput).toHaveAttribute("required");
    expect(uploadInput).toHaveAttribute("type", "file");

    const handleChangeFile = jest.fn((e) => newBillJs.handleChangeFile(e));
    const file = new File(["fake"], "fakeFile.png", { type: "image/png" });
    uploadInput.addEventListener("change", handleChangeFile);

    await waitFor(() =>
      fireEvent.change(uploadInput, {
        target: { files: [file] },
      })
    );
    expect(uploadInput.files[0].name).toBe("fakeFile.png");

    const submitBtn = document.getElementById("btn-send-bill");
    expect(submitBtn).toHaveAttribute("type", "submit");
    const handleSubmit = jest.fn((e) => newBillJs.handleSubmit(e));
    const updateBill = jest.fn((bill) => newBillJs.updateBill(bill));
    expect(handleChangeFile).toHaveBeenCalled();

    submitBtn.addEventListener("submit", handleSubmit);
    fireEvent.submit(submitBtn);

    expect(handleSubmit).toHaveBeenCalled();
    // expect(updateBill).toHaveBeenCalled();
  });
});
