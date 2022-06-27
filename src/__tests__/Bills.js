/**
 * @jest-environment jsdom
 */

import "@testing-library/jest-dom";
import { screen, waitFor, getByTestId, fireEvent } from "@testing-library/dom";
import BillsUI from "../views/BillsUI.js";
import { bills } from "../fixtures/bills.js";
import { ROUTES, ROUTES_PATH } from "../constants/routes";
import { localStorageMock } from "../__mocks__/localStorage.js";
import mockStore from "../__mocks__/store";
import router from "../app/Router.js";
import Bills from "../containers/Bills.js";
import userEvent from "@testing-library/user-event";

jest.mock("../app/store", () => mockStore);

describe("Given I am connected as an employee", () => {
  describe("When I am on Bills Page", () => {
    test("Then I should be able to fetch bills from mock API GET", async () => {
      window.localStorage.setItem(
        "user",
        JSON.stringify({
          type: "Employee",
          email: "a@a",
        })
      );
      const root = document.createElement("div");
      root.setAttribute("id", "root");
      document.body.append(root);
      router();
      window.onNavigate(ROUTES_PATH.Bills);
      await waitFor(() => screen.getByText("Mes notes de frais"));
      expect(screen.getByText("Mes notes de frais")).toBeTruthy();
      const buttonNewBill = await waitFor(() => screen.getByTestId("btn-new-bill"));
      expect(buttonNewBill).toBeTruthy();
    });

    test("Then bill icon in vertical layout should be highlighted", async () => {
      Object.defineProperty(window, "localStorage", {
        value: localStorageMock,
      });
      window.localStorage.setItem(
        "user",
        JSON.stringify({
          type: "Employee",
          email: "a@a",
        })
      );
      const root = document.createElement("div");
      root.setAttribute("id", "root");
      document.body.append(root);
      router();

      window.onNavigate(ROUTES_PATH.Bills);

      const windowIcon = screen.getAllByTestId("icon-window")[0];
      expect(windowIcon.classList.contains("active-icon")).toBeTruthy();
    });

    describe("When I click on the button Nouvelle note de frais", () => {
      test("it should open call handleClickNewBill()", async () => {
        document.body.innerHTML = BillsUI({
          data: bills,
        });
        const onNavigate = (pathname) => {
          document.body.innerHTML = ROUTES({
            pathname,
          });
        };
        Object.defineProperty(window, "localStorage", {
          value: localStorageMock,
        });
        window.localStorage.setItem(
          "user",
          JSON.stringify({
            type: "Employee",
            email: "a@a",
          })
        );

        const billsJs = new Bills({
          document,
          onNavigate,
          store: null,
          bills: bills,
          localStorage: window.localStorage,
        });

        const handleClickNewBill = jest.fn((e) =>
          billsJs.handleClickNewBill(e)
        );
        const buttonNewBill = screen.getByTestId("btn-new-bill");

        expect(buttonNewBill).toBeTruthy();
        expect(buttonNewBill.innerHTML).toBe("Nouvelle note de frais");

        buttonNewBill.addEventListener("click", handleClickNewBill);
        userEvent.click(buttonNewBill);
        expect(handleClickNewBill).toHaveBeenCalled();

        await waitFor(() => screen.getByTestId(`form-new-bill`));
        expect(screen.getByTestId(`form-new-bill`)).toBeTruthy();
      });
    });

    describe("When I click on the icon eye of a bill", () => {
      test("it should call handleClickIconEye() and open a modal", () => {
        Object.defineProperty(window, localStorage, {
          value: localStorageMock,
        });
        window.localStorage.setItem(
          "user",
          JSON.stringify({ type: "Employee" })
        );
        document.body.innerHTML = BillsUI({
          data: bills,
        });
        const onNavigate = (pathname) => {
          document.body.innerHTML = ROUTES({
            pathname,
          });
        };
        const billsJs = new Bills({
          document,
          onNavigate,
          store: null,
          localStorage: localStorageMock,
        });

        $.fn.modal = jest.fn();

        const handleClick = jest.fn((e) => billsJs.handleClickIconEye);
        const iconEye = screen.queryAllByTestId("icon-eye")[0];
        expect(iconEye).toBeTruthy();
        expect(iconEye).toHaveAttribute("data-bill-url");
        iconEye.addEventListener("click", handleClick);
        fireEvent.click(iconEye);
        expect(handleClick).toHaveBeenCalled();
        expect($.fn.modal).toHaveBeenCalled();
      });
    });

    describe("When an error occurs on API", () => {
      beforeEach(() => {
        jest.spyOn(mockStore, "bills");
        Object.defineProperty(window, "localStorage", {
          value: localStorageMock,
        });
        window.localStorage.setItem(
          "user",
          JSON.stringify({
            type: "Employee",
            email: "a@a",
          })
        );
        const root = document.createElement("div");
        root.setAttribute("id", "root");
        document.body.appendChild(root);
        router();
      });

      test("Then I fail to fetch bills from the API and receive a 404 error message", async () => {
        mockStore.bills.mockImplementationOnce(() => {
          return {
            list: () => {
              return Promise.reject(new Error("Erreur 404"));
            },
          };
        });
        window.onNavigate(ROUTES_PATH.Bills);
        await new Promise(process.nextTick);
        const message = await waitFor(() => screen.getByText(/Erreur 404/));
        expect(message).toBeTruthy();
      });

      test("Then I fail to fetch messages from the API and receive a 500 error message", async () => {
        mockStore.bills.mockImplementationOnce(() => {
          return {
            list: () => {
              return Promise.reject(new Error("Erreur 500"));
            },
          };
        });

        window.onNavigate(ROUTES_PATH.Bills);
        await new Promise(process.nextTick);
        const message = await waitFor(() => screen.getByText(/Erreur 500/));
        expect(message).toBeTruthy();
      });
    });
  });
});