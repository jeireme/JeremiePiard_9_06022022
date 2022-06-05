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
    describe("If there are no bills", () => {
      test("Then, no icon eyes should be shown", () => {
        document.body.innerHTML = BillsUI({ data: [] });
        const iconEye = screen.queryByTestId("icon-eye");
        expect(iconEye).toBeNull();
      });
    });

    test("Then the number of bills should be positive", () => {
      const onNavigate = (pathname) => {
        document.body.innerHTML = ROUTES({ pathname });
      };
      const billsJs = new Bills({
        document,
        onNavigate,
        store: null,
        bills: bills,
        localStorage: window.localStorage,
      });
      document.body.innerHTML = BillsUI({ data: bills });
      const tbody = screen.queryByTestId("tbody");
      expect(tbody.innerHTML).not.toBeNull();
    });

    test('When I click on the button "Nouvelle note de frais", it should open call handleClickNewBill()', async () => {
      const onNavigate = (pathname) => {
        document.body.innerHTML = ROUTES({ pathname });
      };

      const billsJs = new Bills({
        document,
        onNavigate,
        store: null,
        bills: bills,
        localStorage: window.localStorage,
      });

      document.body.innerHTML = BillsUI({ data: bills });

      const handleClickNewBill = jest.fn((e) => billsJs.handleClickNewBill(e));
      const buttonNewBill = screen.getByTestId("btn-new-bill");

      buttonNewBill.addEventListener("click", handleClickNewBill);
      userEvent.click(buttonNewBill);
      expect(handleClickNewBill).toHaveBeenCalled();

      await waitFor(() => screen.getByTestId(`form-new-bill`));
      expect(screen.getByTestId(`form-new-bill`)).toBeTruthy();
    });

    test("When I click on the icon eye of a bill, it should call handleClickIconEye()", () => {
      const onNavigate = (pathname) => {
        document.body.innerHTML = ROUTES({ pathname });
      };
      const billsJs = new Bills({
        document,
        onNavigate,
        store: null,
        bills: bills,
        localStorage: window.localStorage,
      });
      document.body.innerHTML = BillsUI({ data: bills });
      const handleClick = jest.fn((icon) => billsJs.handleClickIconEye());
      const iconEye = screen.queryAllByTestId("icon-eye")[0];
      expect(iconEye).toBeTruthy();
      expect(iconEye).toHaveAttribute("data-bill-url");
      console.log(iconEye);
      iconEye.addEventListener("click", handleClick);
      fireEvent.click(iconEye);
      expect(handleClick).toHaveBeenCalled();
    });

    test('I should see a button "Nouvelle Note De Frais"', () => {
      document.body.innerHTML = BillsUI({ data: bills });
      const newBillBtn = screen.getByTestId("btn-new-bill");
      expect(newBillBtn.innerHTML).toBe("Nouvelle note de frais");
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
      window.onNavigate(ROUTES_PATH.Bills);
      await waitFor(() => screen.getByTestId("icon-window"));
      const windowIcon = screen.getByTestId("icon-window");

      // ? to-do write expect expression :
      expect(
        document
          .getElementById("layout-icon1")
          .classList.contains("active-icon")
      ).toBeTruthy();
    });

    test("Then bills should be ordered from earliest to latest", () => {
      document.body.innerHTML = BillsUI({
        data: bills,
      });

      // 2021-11-22 : dates mocked format
      // 22/11/2021 : dates displayed format
      const dates = screen
        .getAllByText(
          /^(0[1-9]|[12][0-9]|3[01])[/](0[1-9]|1[012])[/](19|20)\d\d$/i
        )
        .map((a) => a.innerHTML);
      const antiChrono = (a, b) => (a < b ? 1 : -1);
      const datesSorted = [...dates].sort(antiChrono);
      expect(dates).toEqual(datesSorted);
    });
  });

  // ? API & GET
  describe("When I navigate to Bills page", () => {
    test("Then I fetch bills from mock API GET", async () => {
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
      window.onNavigate(ROUTES_PATH.Bills);
      console.log(screen);
      await waitFor(() => screen.getByText("Mes notes de frais"));
      const buttonNewBill = await screen.getByTestId("btn-new-bill");
      expect(buttonNewBill).toBeTruthy();
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
      const message = await screen.getByText(/Erreur 404/);
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
      const message = await screen.getByText(/Erreur 500/);
      expect(message).toBeTruthy();
    });
  });
});
