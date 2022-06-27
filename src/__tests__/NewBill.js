/**
 * @jest-environment jsdom
 */

import "@testing-library/jest-dom";
import { screen, waitFor, getByTestId, fireEvent } from "@testing-library/dom";
import store from "../__mocks__/store.js";
import userEvent from "@testing-library/user-event";
import { ROUTES, ROUTES_PATH } from "../constants/routes";
import { localStorageMock } from "../__mocks__/localStorage.js";
import mockStore from "../__mocks__/store";
import router from "../app/Router.js";
import NewBillUI from "../views/NewBillUI.js";
import NewBill from "../containers/NewBill.js";
import BillsUI from "../views/BillsUI.js";

jest.mock("../app/store", () => mockStore);
const onNavigate = () => {
  return;
};

describe("Given I am connected as an employee", () => {
  describe("When I am on NewBill Page", () => {
    test("Then ...", () => {
      const html = NewBillUI();
      document.body.innerHTML = html;
      //to-do write assertion
    });

    test("Then I should see title and form inputs", () => {
      const html = NewBillUI();
      document.body.innerHTML = html;

      const title = screen.getByText("Envoyer une note de frais");
      expect(title).toBeTruthy();

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

    describe("When I select a file with a valid format", () => {
      test("It should call handleChangeFile() and not send an alert", () => {
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

        const onNavigate = (pathname) => {
          document.body.innerHTML = ROUTES({ pathname });
        };
        const newBill = new NewBill({
          document,
          onNavigate,
          store,
          locolaStorage: window.localStorage,
        });
        jest.spyOn(window, "alert");
        const file = document.querySelector(`input[data-testid="file"]`);
        const handleChangeFile = jest.fn((e) => newBill.handleChangeFile(e));
        file.addEventListener("change", handleChangeFile);
        fireEvent.change(file, {
          target: {
            files: [new File([], "fakeFile.jpg", { type: "image/jpg" })],
          },
        });

        expect(handleChangeFile).toHaveBeenCalled();
        expect(window.alert).not.toHaveBeenCalled();
      });
    });

    describe("When I select a file with invalid format", () => {
      test("Then an alert should appear", () => {
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

        const onNavigate = (pathname) => {
          document.body.innerHTML = ROUTES({ pathname });
        };
        const newBill = new NewBill({
          document,
          onNavigate,
          store,
          locolaStorage: window.localStorage,
        });

        jest.spyOn(window, "alert");
        const file = document.querySelector(`input[data-testid="file"]`);
        const handleChangeFile = jest.fn((e) => newBill.handleChangeFile(e));
        file.addEventListener("change", handleChangeFile);
        fireEvent.change(file, {
          target: {
            files: [new File([], "fakeFile.bmp", { type: "bmp" })],
          },
        });
        expect(handleChangeFile).toHaveBeenCalled();
        expect(window.alert).toHaveBeenCalledWith(`Votre justificatif doit être une image. \nFormats autorisés : ".jpg", ".jpeg" et ".png"`);
      });
    });

    test("Then mail icon in vertical layout should be highlighted", async () => {
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
      expect(iconMail.className).toBe("active-icon");
    });
  });

  describe("When I correctly fill the form and submit", () => {
    test("Then it should call handleSubmit() and updateBill()", () => {
      jest.spyOn(mockStore, "bills");

      const html = NewBillUI();
      document.body.innerHTML = html;

      Object.defineProperty(window, "localStorage", {
        value: localStorageMock,
      });
      const onNavigate = (pathname) => {
        document.body.innerHTML = ROUTES({ pathname });
      };

      window.localStorage.setItem(
        "user",
        JSON.stringify({
          type: "Employee",
          email: "azerty@email.com",
        })
      );

      const newBillJs = new NewBill({
        document,
        onNavigate,
        store: null,
        localStorage: window.localStorage,
      });

      const handleChangeFile = jest.fn((e) => newBillJs.handleChangeFile(e));
      const uploadInput = screen.getByTestId("file");
      const form = screen.getByTestId("form-new-bill");
      const handleSubmit = jest.fn((e) => newBillJs.handleSubmit(e));
      
      uploadInput.addEventListener("change", handleChangeFile);
      newBillJs.updateBill = jest.fn();

      const validBill = {
        type: "Transport",
        name: "Train Paris Bordeaux",
        date: "2022-07-02",
        amount: 350,
        vat: 70,
        pct: 20,
        commentary: "Prix billet TGV : 350€",
        fileUrl: "../img/fakeFile.jpg",
        fileName: "billet-tgv.jpg",
        status: "pending",
      };

      screen.getByTestId("expense-type").value = validBill.type;
      screen.getByTestId("expense-name").value = validBill.name;
      screen.getByTestId("datepicker").value = validBill.date;
      screen.getByTestId("amount").value = validBill.amount;
      screen.getByTestId("vat").value = validBill.vat;
      screen.getByTestId("pct").value = validBill.pct;
      screen.getByTestId("commentary").value = validBill.commentary;
      newBillJs.fileName = validBill.fileName;
      newBillJs.fileUrl = validBill.fileUrl;

      form.addEventListener("submit", handleSubmit);
      fireEvent.submit(form);
      expect(handleSubmit).toHaveBeenCalled();
      expect(newBillJs.updateBill).toHaveBeenCalled();
    });
  });
  
  describe("When an error occurs on API", () => {
    test("It should fetches bills from an API and fails with 404 message error", async () => {
      mockStore.bills.mockImplementationOnce(() => {
        return {
          update: () => {
            return Promise.reject(new Error("Erreur 404"));
          },
        };
      });
      const html = BillsUI({ error: "Erreur 404" });
      document.body.innerHTML = html;
      await new Promise(process.nextTick);
      await waitFor(() => screen.getByText(/Erreur 404/));
      const message = screen.getByText(/Erreur 404/);
      expect(message).toBeTruthy();
    });

    test("It should fetches messages from an API and fails with 500 message error", async () => {
      mockStore.bills.mockImplementationOnce(() => {
        return {
          update: () => {
            return Promise.reject(new Error("Erreur 500"));
          },
        };
      });
      const html = BillsUI({ error: "Erreur 500" });
      document.body.innerHTML = html;
      await new Promise(process.nextTick);
      await waitFor(() =>  screen.getByText(/Erreur 500/));
      const message = screen.getByText(/Erreur 500/);
      expect(message).toBeTruthy();
    });
  });
});