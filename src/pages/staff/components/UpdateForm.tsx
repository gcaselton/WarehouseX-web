import { updateStaff } from '@/services/ant-design-pro/api';
import { PlusOutlined } from '@ant-design/icons';
import { ActionType, ModalForm, ProFormText, ProFormTextArea, ProForm } from '@ant-design/pro-components';
import { FormattedMessage, useIntl, useRequest } from '@umijs/max';
import { message, Switch } from 'antd';
import { FC } from 'react';

interface CreateFormProps {
  reload?: ActionType['reload'];
}

// CreateForm component for updating staff details
const CreateForm: FC<CreateFormProps> = (props) => {
  const { reload } = props;
  const [messageApi, contextHolder] = message.useMessage();
  const intl = useIntl();

  // UseRequest hook for handling API requests
  const { loading } = useRequest(updateStaff, {
    manual: true,
    onSuccess: () => {
      messageApi.success('Added successfully');
      reload?.();
    },
    onError: () => {
      messageApi.error('Adding failed, please try again!');
    },
  });

  return (
    <>
      {contextHolder}
      {/* ModalForm for updating staff details */}
      <ModalForm
        initialValues={{
          ...props.values,
          // status:1
        }}
        title={intl.formatMessage({
          id: 'add staff',
          defaultMessage: 'Update Details',
        })}
        trigger={
          <a
            type="primary"
            style={{ display: props.values?.currentUserRoleId === 1 ? 'inline' : 'none' }}
            icon={<PlusOutlined />}
          >
            <FormattedMessage id="update" defaultMessage="Update" />
          </a>
        }
        width="400px"
        modalProps={{ okButtonProps: { loading } }}
        // Function to handle form submission
        onFinish={async (value) => {
          console.log(value, 'add staff');
          let formData = {
            ...value,
            name: value?.username,
            status: value?.status ? 1 : 0,
            password: 111111,
            description: "",
            id: props.values.id,
          };
          console.log('formdata-----updateStaff', formData);
          let res = await updateStaff({ ...formData });
          console.log('addNewRole', res);
          if (res?.code === 200) {
            messageApi.success('Added successfully');
            setTimeout(() => {
              window.location.reload();
            }, 2000);
          } else if (res?.code === 209) {
            messageApi.error('Update successfully!');
          } else {
            messageApi.error('Update failed, please try again!');
          }
          return true;
        }}
      >
        {/* ProFormText for entering username */}
        <ProFormText
          rules={[
            {
              required: true,
              message: (
                <FormattedMessage
                  id="userName"
                  defaultMessage="Name is required"
                />
              ),
            },
          ]}
          width="md"
          name="username"
          label={intl.formatMessage({
            id: 'userName',
            defaultMessage: 'Name',
          })}
        />
        {/* ProFormText for entering phone number */}
        <ProFormText
          rules={[
            {
              required: true,
              message: (
                <FormattedMessage
                  id="phone"
                  defaultMessage="Phone Number is required"
                />
              ),
            },
          ]}
          width="md"
          name="phone"
          label={intl.formatMessage({
            id: 'phone',
            defaultMessage: 'Phone Number',
          })}
        />
        {/* ProForm item for role status */}
        <ProForm.Item
          rules={[
            {
              required: false,
              message: <FormattedMessage id="status" />,
            },
          ]}
          width="md"
          name="status"
          label={intl.formatMessage({
            id: 'role status',
            defaultMessage: 'Role Status',
          })}
        >
          {/* Switch component for toggling status */}
          <Switch
            style={{
              marginBlockEnd: 16,
            }}
            defaultValue={props?.values?.status === 1}
            // checked={true}
            checkedChildren="On"
            unCheckedChildren="Off"
          />
        </ProForm.Item>
        {/* ProFormTextArea for entering notes */}
        <ProFormTextArea
          width="md"
          name="desc"
          label={intl.formatMessage({
            id: 'pages.newOrder.notes',
            defaultMessage: 'Notes',
          })}
        />
      </ModalForm>
    </>
  );
};

export default CreateForm;
