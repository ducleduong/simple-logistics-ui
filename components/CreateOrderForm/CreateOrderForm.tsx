"use client";
import { createAddress, getCountries } from "@/api/address-api";
import { Field, Form, Formik, FormikProps } from "formik";
import { useEffect, useState } from "react";
import CustomersList, { Customer } from "../CustomersList/CustomersList";
import {
  checkCustomer,
  createCustomer,
  getCustomers,
} from "@/api/customer-api";
import moment from "moment";
import { createOrder } from "@/api/orders-api";
import { useRouter } from "next/navigation";

type City = {
  id: number;
  name: string;
};

type State = {
  id: number;
  name: string;
  cities: City[];
};

type Country = {
  id: number;
  name: string;
  states: State[];
};

export interface FormValues {
  customerFirstName: string;
  customerLastName: string;
  recipientAddress: string;
  recipientCountry: string;
  recipientState: string;
  recipientCity: string;
  shippingAddress: string;
  shippingCountry: string;
  shippingCity: string;
  shippingState: string;
  expectedDeliveryDate: string;
  recipientPostalCode: string;
  shippingPostalCode: string;
}

const CreateOrderForm = () => {
  const router = useRouter();

  const handleSubmit = async (values: FormValues) => {
    const bodyOrder: any = {};
    try {
      const responseCustomer = await checkCustomer({
        firstName: values.customerFirstName,
        lastName: values.customerLastName,
      });
      if (responseCustomer?.data) {
        const recipientAddressId = responseCustomer.data.addresses.find(
          (address: any) =>
            address.address === values.recipientAddress &&
            address.cityId === parseInt(values.recipientCity) &&
            address.countryId === parseInt(values.recipientCountry) &&
            address.stateId === parseInt(values.recipientState) &&
            address.postalCode === values.recipientPostalCode
        )?.addressId;

        if (recipientAddressId)
          bodyOrder["recipientAddressId"] = recipientAddressId;
        else {
          const newrecipientAddress = await createAddress({
            address: values.recipientAddress,
            countryId: parseInt(values.recipientCountry),
            stateId: parseInt(values.recipientState),
            cityId: parseInt(values.recipientCity),
            postalCode: values.recipientPostalCode,
            customerId: responseCustomer.data.customerId,
          });
          if (newrecipientAddress?.data)
            bodyOrder["recipientAddressId"] =
              newrecipientAddress?.data.addressId;
        }

        if (
          values.recipientAddress === values.shippingAddress &&
          values.recipientCountry === values.shippingCountry &&
          values.recipientPostalCode === values.shippingPostalCode &&
          values.recipientState === values.shippingState &&
          values.recipientCity === values.shippingCity
        )
          bodyOrder["shippingAddressId"] = bodyOrder["recipientAddressId"];
        else {
          const shippingAddressId = responseCustomer.data.addresses.find(
            (address: any) =>
              address.address === values.shippingAddress &&
              address.cityId === parseInt(values.shippingCity) &&
              address.countryId === parseInt(values.shippingCountry) &&
              address.stateId === parseInt(values.shippingState) &&
              address.postalCode === values.shippingPostalCode
          )?.addressId;

          if (shippingAddressId)
            bodyOrder["shippingAddressId"] = shippingAddressId;
          else {
            const newShippingAddress = await createAddress({
              address: values.shippingAddress,
              countryId: parseInt(values.shippingCountry),
              stateId: parseInt(values.shippingState),
              cityId: parseInt(values.shippingCity),
              postalCode: values.shippingPostalCode,
              customerId: responseCustomer.data.customerId,
            });
            if (newShippingAddress?.data)
              bodyOrder["shippingAddressId"] =
                newShippingAddress?.data.addressId;
          }
        }
        bodyOrder["customerId"] = responseCustomer?.data.customerId;
      }
    } catch (err: any) {
      if (err.response.data.statusCode === 404) {
        const newCustomer = await createCustomer({
          firstName: values.customerFirstName,
          lastName: values.customerLastName,
        });

        if (newCustomer?.data) {
          const newrecipientAddress = await createAddress({
            address: values.recipientAddress,
            countryId: parseInt(values.recipientCountry),
            stateId: parseInt(values.recipientState),
            cityId: parseInt(values.recipientCity),
            postalCode: values.recipientPostalCode,
            customerId: newCustomer?.data.customerId,
          });
          if (newrecipientAddress?.data)
            bodyOrder["recipientAddressId"] =
              newrecipientAddress?.data.addressId;

          if (
            values.recipientAddress === values.shippingAddress &&
            values.recipientCountry === values.shippingCountry &&
            values.recipientPostalCode === values.shippingPostalCode &&
            values.recipientState === values.shippingState &&
            values.recipientCity === values.shippingCity
          )
            bodyOrder["shippingAddressId"] = bodyOrder["recipientAddressId"];
          else {
            const newShippingAddress = await createAddress({
              address: values.shippingAddress,
              countryId: parseInt(values.shippingCountry),
              stateId: parseInt(values.shippingState),
              cityId: parseInt(values.shippingCity),
              postalCode: values.shippingPostalCode,
              customerId: newCustomer.data.customerId,
            });
            if (newShippingAddress?.data)
              bodyOrder["shippingAddressId"] =
                newShippingAddress?.data.addressId;
          }
          bodyOrder["customerId"] = newCustomer?.data.customerId;
        }
      }
    }

    bodyOrder["expectedDeliveryDate"] = moment(
      values.expectedDeliveryDate
    ).format();

    const response = await createOrder(bodyOrder);

    if (response.data) {
      router.push("/");
    }
  };

  const initialValues: FormValues = {
    customerFirstName: "",
    customerLastName: "",
    recipientAddress: "",
    recipientCountry: "",
    recipientState: "",
    recipientCity: "",
    shippingAddress: "",
    shippingCountry: "",
    shippingCity: "",
    shippingState: "",
    expectedDeliveryDate: "",
    recipientPostalCode: "",
    shippingPostalCode: "",
  };

  const [countries, setCountry] = useState<Country[]>([]);
  const [states, setState] = useState<State[]>([]);
  const [cities, setCity] = useState<City[]>([]);
  const [shippingCountries, setShippingCountry] = useState<Country[]>([]);
  const [shippingStates, setShippingState] = useState<State[]>([]);
  const [shippingCities, setShippingCity] = useState<City[] | undefined>([]);
  const [customers, setCustomer] = useState<Customer[]>([]);

  useEffect(() => {
    const getCountryData = async () => {
      const response = await getCountries();

      if (response.data) {
        setCountry(response.data);
        setShippingCountry(response.data);
      }
    };
    getCountryData();
  }, []);

  const handleChangeCountry = (event: any) => {
    setState(
      countries.find(
        (country: Country) => country.id === parseInt(event.target.value)
      )?.states || []
    );
    setCity([]);
  };

  const handleChangeState = (event: any) => {
    setCity(
      states.find((state: State) => state.id === parseInt(event.target.value))
        ?.cities || []
    );
  };

  const handleChangeShippingCountry = (event: any) => {
    setShippingState(
      shippingCountries.find(
        (country: Country) => country.id === parseInt(event.target.value)
      )?.states || []
    );
    setShippingCity([]);
  };

  const handleChangeShippingState = (event: any) => {
    setShippingCity(
      shippingStates.find(
        (state: State) => state.id === parseInt(event.target.value)
      )?.cities || []
    );
  };

  const handleSetSameAddress = (prop: FormikProps<FormValues>) => {
    setShippingCity(cities);
    setShippingCountry(countries);
    setShippingState(states);
    prop.setFieldValue("shippingCountry", prop.values.recipientCountry);
    prop.setFieldValue("shippingState", prop.values.recipientState);
    prop.setFieldValue("shippingCity", prop.values.recipientCity);
    prop.setFieldValue("shippingAddress", prop.values.recipientAddress);
    prop.setFieldValue("shippingPostalCode", prop.values.recipientPostalCode);
  };

  const handleListCustomers = async () => {
    const response = await getCustomers();

    if (response.data) setCustomer(response.data);
  };

  const handleSelectCustomer = (
    prop: FormikProps<FormValues>,
    customerId: number,
    addressIndex: number
  ) => {
    const customer = customers.find(
      (customer: Customer) => customer.customerId === customerId
    );
    prop.setFieldValue("customerFirstName", customer?.firstName);
    prop.setFieldValue("customerLastName", customer?.lastName);
    prop.setFieldValue(
      "recipientCountry",
      customer?.addresses[addressIndex].country.id.toString()
    );
    prop.setFieldValue(
      "recipientState",
      customer?.addresses[addressIndex].state.id.toString()
    );
    prop.setFieldValue(
      "recipientCity",
      customer?.addresses[addressIndex].city.id.toString()
    );
    prop.setFieldValue(
      "recipientAddress",
      customer?.addresses[addressIndex].address
    );
    prop.setFieldValue(
      "recipientPostalCode",
      customer?.addresses[addressIndex].postalCode
    );
    const state =
      countries.find(
        (country: Country) =>
          country.id === customer?.addresses[addressIndex].country.id
      )?.states || [];
    setState(state);
    setCity(
      state.find(
        (state: State) =>
          state.id === customer?.addresses[addressIndex].state.id
      )?.cities || []
    );
  };

  return (
    <Formik initialValues={initialValues} onSubmit={handleSubmit}>
      {(prop: FormikProps<FormValues>) => (
        <div className="flex justify-center">
          <div className="rounded-sm border border-stroke bg-white shadow-default dark:border-strokedark dark:bg-boxdark">
            <div className="border-b border-stroke py-4 px-6.5 dark:border-strokedark">
              <h3 className="font-medium text-black dark:text-white">
                Create order
              </h3>
            </div>
            <Form onSubmit={prop.handleSubmit}>
              <div className="p-6.5">
                <div className="flex border-stroke border-b dark:border-strokedark py-2 mb-4 justify-between w-full">
                  <div className="font-medium text-black dark:text-white">
                    Customer
                  </div>
                  <div
                    className="text-sm text-primary cursor-pointer"
                    onClick={handleListCustomers}
                  >
                    Choose from list
                  </div>
                </div>
                <div className="mb-4.5 flex flex-col gap-6 xl:flex-row">
                  <div className="w-full xl:w-1/2">
                    <Field
                      name="customerFirstName"
                      type="text"
                      placeholder="First name"
                      className="w-full rounded border-[1.5px] border-stroke bg-transparent py-3 px-5 font-medium outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-whiter dark:border-form-strokedark dark:bg-form-input dark:focus:border-primary"
                    />
                  </div>

                  <div className="w-full xl:w-1/2">
                    <Field
                      name="customerLastName"
                      type="text"
                      placeholder="Last name"
                      className="w-full rounded border-[1.5px] border-stroke bg-transparent py-3 px-5 font-medium outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-whiter dark:border-form-strokedark dark:bg-form-input dark:focus:border-primary"
                    />
                  </div>
                </div>

                <div className="flex border-stroke border-b dark:border-strokedark py-2 mb-4 justify-between w-full">
                  <div className="font-medium text-black dark:text-white">
                    Recipient Address
                  </div>
                </div>

                <div className="mb-4.5">
                  <div className="relative z-20 bg-transparent dark:bg-form-input">
                    <Field
                      onChange={(event: any) => {
                        prop.setFieldValue(
                          "recipientCountry",
                          event.target.value
                        );
                        handleChangeCountry(event);
                      }}
                      as="select"
                      disabled={countries.length === 0}
                      name="recipientCountry"
                      className="relative z-20 w-full appearance-none rounded border border-stroke bg-transparent py-3 px-5 outline-none transition focus:border-primary active:border-primary dark:border-form-strokedark dark:bg-form-input dark:focus:border-primary"
                    >
                      <option value="">Country</option>
                      {countries.map((country: Country) => (
                        <option key={country.id} value={country.id}>
                          {country.name}
                        </option>
                      ))}
                    </Field>
                    <span className="absolute top-1/2 right-4 z-30 -translate-y-1/2">
                      <svg
                        className="fill-current"
                        width="24"
                        height="24"
                        viewBox="0 0 24 24"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <g opacity="0.8">
                          <path
                            fillRule="evenodd"
                            clipRule="evenodd"
                            d="M5.29289 8.29289C5.68342 7.90237 6.31658 7.90237 6.70711 8.29289L12 13.5858L17.2929 8.29289C17.6834 7.90237 18.3166 7.90237 18.7071 8.29289C19.0976 8.68342 19.0976 9.31658 18.7071 9.70711L12.7071 15.7071C12.3166 16.0976 11.6834 16.0976 11.2929 15.7071L5.29289 9.70711C4.90237 9.31658 4.90237 8.68342 5.29289 8.29289Z"
                            fill=""
                          ></path>
                        </g>
                      </svg>
                    </span>
                  </div>
                </div>

                <div className="mb-4.5">
                  <div className="relative z-20 bg-transparent dark:bg-form-input">
                    <Field
                      name="recipientState"
                      as="select"
                      disabled={states.length === 0}
                      onChange={(event: any) => {
                        prop.setFieldValue(
                          "recipientState",
                          event.target.value
                        );
                        handleChangeState(event);
                      }}
                      className="relative z-20 w-full appearance-none rounded border border-stroke bg-transparent py-3 px-5 outline-none transition focus:border-primary active:border-primary dark:border-form-strokedark dark:bg-form-input dark:focus:border-primary"
                    >
                      <option value="">State</option>
                      {states.map((state: State) => (
                        <option key={state.id} value={state.id}>
                          {state.name}
                        </option>
                      ))}
                    </Field>
                    <span className="absolute top-1/2 right-4 z-30 -translate-y-1/2">
                      <svg
                        className="fill-current"
                        width="24"
                        height="24"
                        viewBox="0 0 24 24"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <g opacity="0.8">
                          <path
                            fillRule="evenodd"
                            clipRule="evenodd"
                            d="M5.29289 8.29289C5.68342 7.90237 6.31658 7.90237 6.70711 8.29289L12 13.5858L17.2929 8.29289C17.6834 7.90237 18.3166 7.90237 18.7071 8.29289C19.0976 8.68342 19.0976 9.31658 18.7071 9.70711L12.7071 15.7071C12.3166 16.0976 11.6834 16.0976 11.2929 15.7071L5.29289 9.70711C4.90237 9.31658 4.90237 8.68342 5.29289 8.29289Z"
                            fill=""
                          ></path>
                        </g>
                      </svg>
                    </span>
                  </div>
                </div>

                <div className="mb-4.5">
                  <div className="relative z-20 bg-transparent dark:bg-form-input">
                    <Field
                      as="select"
                      disabled={
                        cities.length === 0 && prop.values.recipientState === ""
                      }
                      name="recipientCity"
                      className="relative z-20 w-full appearance-none rounded border border-stroke bg-transparent py-3 px-5 outline-none transition focus:border-primary active:border-primary dark:border-form-strokedark dark:bg-form-input dark:focus:border-primary"
                    >
                      <option value="">City</option>
                      {cities.map((city: City) => (
                        <option value={city.id} key={city.id}>
                          {city.name}
                        </option>
                      ))}
                    </Field>
                    <span className="absolute top-1/2 right-4 z-30 -translate-y-1/2">
                      <svg
                        className="fill-current"
                        width="24"
                        height="24"
                        viewBox="0 0 24 24"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <g opacity="0.8">
                          <path
                            fillRule="evenodd"
                            clipRule="evenodd"
                            d="M5.29289 8.29289C5.68342 7.90237 6.31658 7.90237 6.70711 8.29289L12 13.5858L17.2929 8.29289C17.6834 7.90237 18.3166 7.90237 18.7071 8.29289C19.0976 8.68342 19.0976 9.31658 18.7071 9.70711L12.7071 15.7071C12.3166 16.0976 11.6834 16.0976 11.2929 15.7071L5.29289 9.70711C4.90237 9.31658 4.90237 8.68342 5.29289 8.29289Z"
                            fill=""
                          ></path>
                        </g>
                      </svg>
                    </span>
                  </div>
                </div>

                <div className="mb-6">
                  <div className="w-full">
                    <Field
                      name="recipientAddress"
                      type="text"
                      placeholder="Address"
                      className="w-full rounded border-[1.5px] border-stroke bg-transparent py-3 px-5 font-medium outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-whiter dark:border-form-strokedark dark:bg-form-input dark:focus:border-primary"
                    />
                  </div>
                </div>

                <div className="mb-6">
                  <div className="w-full">
                    <Field
                      name="recipientPostalCode"
                      type="text"
                      placeholder="Postal Code"
                      className="w-full rounded border-[1.5px] border-stroke bg-transparent py-3 px-5 font-medium outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-whiter dark:border-form-strokedark dark:bg-form-input dark:focus:border-primary"
                    />
                  </div>
                </div>

                <div className="flex border-stroke border-b dark:border-strokedark py-2 mb-4 justify-between w-full">
                  <div className="font-medium text-black dark:text-white">
                    Shipping Address
                  </div>
                  <div
                    className="text-sm text-primary cursor-pointer"
                    onClick={() => handleSetSameAddress(prop)}
                  >
                    Same as recipient address
                  </div>
                </div>

                <div className="mb-4.5">
                  <div className="relative z-20 bg-transparent dark:bg-form-input">
                    <Field
                      as="select"
                      name="shippingCountry"
                      onChange={(event: any) => {
                        prop.setFieldValue(
                          "shippingCountry",
                          event.target.value
                        );
                        handleChangeShippingCountry(event);
                      }}
                      className="relative z-20 w-full appearance-none rounded border border-stroke bg-transparent py-3 px-5 outline-none transition focus:border-primary active:border-primary dark:border-form-strokedark dark:bg-form-input dark:focus:border-primary"
                    >
                      <option value="">Country</option>
                      {shippingCountries.map((country: Country) => (
                        <option value={country.id} key={country.id}>
                          {country.name}
                        </option>
                      ))}
                    </Field>
                    <span className="absolute top-1/2 right-4 z-30 -translate-y-1/2">
                      <svg
                        className="fill-current"
                        width="24"
                        height="24"
                        viewBox="0 0 24 24"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <g opacity="0.8">
                          <path
                            fillRule="evenodd"
                            clipRule="evenodd"
                            d="M5.29289 8.29289C5.68342 7.90237 6.31658 7.90237 6.70711 8.29289L12 13.5858L17.2929 8.29289C17.6834 7.90237 18.3166 7.90237 18.7071 8.29289C19.0976 8.68342 19.0976 9.31658 18.7071 9.70711L12.7071 15.7071C12.3166 16.0976 11.6834 16.0976 11.2929 15.7071L5.29289 9.70711C4.90237 9.31658 4.90237 8.68342 5.29289 8.29289Z"
                            fill=""
                          ></path>
                        </g>
                      </svg>
                    </span>
                  </div>
                </div>

                <div className="mb-4.5">
                  <div className="relative z-20 bg-transparent dark:bg-form-input">
                    <Field
                      as="select"
                      name="shippingState"
                      disabled={shippingStates.length === 0}
                      onChange={(event: any) => {
                        prop.setFieldValue("shippingState", event.target.value);
                        handleChangeShippingState(event);
                      }}
                      className="relative z-20 w-full appearance-none rounded border border-stroke bg-transparent py-3 px-5 outline-none transition focus:border-primary active:border-primary dark:border-form-strokedark dark:bg-form-input dark:focus:border-primary"
                    >
                      <option value="">State</option>
                      {shippingStates.map((state: State) => (
                        <option value={state.id} key={state.id}>
                          {state.name}
                        </option>
                      ))}
                    </Field>
                    <span className="absolute top-1/2 right-4 z-30 -translate-y-1/2">
                      <svg
                        className="fill-current"
                        width="24"
                        height="24"
                        viewBox="0 0 24 24"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <g opacity="0.8">
                          <path
                            fillRule="evenodd"
                            clipRule="evenodd"
                            d="M5.29289 8.29289C5.68342 7.90237 6.31658 7.90237 6.70711 8.29289L12 13.5858L17.2929 8.29289C17.6834 7.90237 18.3166 7.90237 18.7071 8.29289C19.0976 8.68342 19.0976 9.31658 18.7071 9.70711L12.7071 15.7071C12.3166 16.0976 11.6834 16.0976 11.2929 15.7071L5.29289 9.70711C4.90237 9.31658 4.90237 8.68342 5.29289 8.29289Z"
                            fill=""
                          ></path>
                        </g>
                      </svg>
                    </span>
                  </div>
                </div>

                <div className="mb-4.5">
                  <div className="relative z-20 bg-transparent dark:bg-form-input">
                    <Field
                      as="select"
                      name="shippingCity"
                      disabled={shippingCities?.length === 0}
                      className="relative z-20 w-full appearance-none rounded border border-stroke bg-transparent py-3 px-5 outline-none transition focus:border-primary active:border-primary dark:border-form-strokedark dark:bg-form-input dark:focus:border-primary"
                    >
                      <option value="">City</option>
                      {shippingCities &&
                        shippingCities.map((city: City) => (
                          <option value={city.id} key={city.id}>
                            {city.name}
                          </option>
                        ))}
                    </Field>
                    <span className="absolute top-1/2 right-4 z-30 -translate-y-1/2">
                      <svg
                        className="fill-current"
                        width="24"
                        height="24"
                        viewBox="0 0 24 24"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <g opacity="0.8">
                          <path
                            fillRule="evenodd"
                            clipRule="evenodd"
                            d="M5.29289 8.29289C5.68342 7.90237 6.31658 7.90237 6.70711 8.29289L12 13.5858L17.2929 8.29289C17.6834 7.90237 18.3166 7.90237 18.7071 8.29289C19.0976 8.68342 19.0976 9.31658 18.7071 9.70711L12.7071 15.7071C12.3166 16.0976 11.6834 16.0976 11.2929 15.7071L5.29289 9.70711C4.90237 9.31658 4.90237 8.68342 5.29289 8.29289Z"
                            fill=""
                          ></path>
                        </g>
                      </svg>
                    </span>
                  </div>
                </div>

                <div className="mb-6">
                  <div className="w-full">
                    <Field
                      name="shippingAddress"
                      type="text"
                      placeholder="Address"
                      className="w-full rounded border-[1.5px] border-stroke bg-transparent py-3 px-5 font-medium outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-whiter dark:border-form-strokedark dark:bg-form-input dark:focus:border-primary"
                    />
                  </div>
                </div>

                <div className="mb-6">
                  <div className="w-full">
                    <Field
                      name="shippingPostalCode"
                      type="text"
                      placeholder="Postal Code"
                      className="w-full rounded border-[1.5px] border-stroke bg-transparent py-3 px-5 font-medium outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-whiter dark:border-form-strokedark dark:bg-form-input dark:focus:border-primary"
                    />
                  </div>
                </div>

                <div className="flex border-stroke border-b dark:border-strokedark py-2 mb-4 justify-between w-full">
                  <div className="font-medium text-black dark:text-white">
                    Expected Delivery Date (Optional)
                  </div>
                </div>
                <div className="relative mb-6">
                  <Field
                    name="expectedDeliveryDate"
                    type="date"
                    className="custom-input-date custom-input-date-1 w-full rounded border-[1.5px] border-stroke bg-transparent py-3 px-5 font-medium outline-none transition focus:border-primary active:border-primary dark:border-form-strokedark dark:bg-form-input dark:focus:border-primary"
                  />
                </div>
                <button
                  type="submit"
                  className="flex w-full justify-center rounded bg-primary p-3 font-medium text-gray"
                >
                  Create Order
                </button>
              </div>
            </Form>
          </div>
          {customers.length > 0 && (
            <CustomersList
              customers={customers}
              handleClickCustomer={handleSelectCustomer}
              formProps={prop}
            />
          )}
        </div>
      )}
    </Formik>
  );
};

export default CreateOrderForm;
