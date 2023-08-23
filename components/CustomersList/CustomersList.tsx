import { FormikProps } from "formik";
import { FormValues } from "../CreateOrderForm/CreateOrderForm";

export type Customer = {
  firstName: string;
  lastName: string;
  customerId: number;
  addresses: Address[];
};

type Address = {
  address: string;
  addressId: number;
  city: AddressCountry;
  country: AddressCountry;
  state: AddressCountry;
  postalCode: string;
};

type AddressCountry = {
  id: number;
  name: string;
};

type Props = {
  customers: Customer[];
  handleClickCustomer: any;
  formProps: FormikProps<FormValues>
};

const CustomersList = ({ customers, handleClickCustomer, formProps }: Props) => {
  return (
    <div className="mx-2 rounded-sm border border-stroke bg-white pt-6 pb-2.5 shadow-default dark:border-strokedark dark:bg-boxdark xl:pb-1">
      <div className="font-medium text-black pb-2 dark:text-white border-b border-stroke mx-7.5">
        Customer List
      </div>
      <ul className="overflow-y-auto max-h-[1028px]">
        {customers.map((customer: Customer) => (
          <div key={customer.customerId}>
            {customer.addresses.map((address: Address, index: number) => (
              <li
                key={address.addressId}
                className="hover:bg-bodydark2 hover:text-white transition cursor-pointer rounded-sm p-2 my-2 px-7.5"
                onClick={() => handleClickCustomer(formProps, customer.customerId, index)}
              >
                <h3 className="font-bold">{`${customer.firstName} ${customer.lastName}`}</h3>
                <p>{address.address}</p>
                <p>{address.postalCode}</p>
              </li>
            ))}
          </div>
        ))}
      </ul>
    </div>
  );
};

export default CustomersList;
