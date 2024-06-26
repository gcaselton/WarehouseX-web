/**
 * This page lists all current staff members and allows users to perform multiple actions on said users.
 */
import {
  removeRule,
  getStaffLit,
  deleteUserByID,
  getRoleById,
} from '@/services/ant-design-pro/api';
import type { ActionType, ProColumns, ProDescriptionsItemProps } from '@ant-design/pro-components';
import {
  FooterToolbar,
  PageContainer,
  ProDescriptions,
  ProTable,
} from '@ant-design/pro-components';
import { FormattedMessage, useIntl, useRequest } from '@umijs/max';
import { Button, Drawer, message, Modal } from 'antd';
import React, { useCallback, useRef, useState } from 'react';
import CreateForm from '../components/CreateForm';
import UpdateForm from '../components/UpdateForm';
import AssignForm from '../components/AssignForm';
import { useModel } from '@umijs/max';

const TableList: React.FC = () => {
  // Initialize hooks and state
  const { initialState } = useModel('@@initialState');
  const { currentUser } = initialState || {};
  const actionRef = useRef<ActionType>();
  const [showDetail, setShowDetail] = useState<boolean>(false);
  const [currentUserRoleId, setCurrentUserRoleId] = useState<number>(0);
  const [currentRow, setCurrentRow] = useState<API.RuleListItem>();
  const [selectedRowsState, setSelectedRows] = useState<API.RuleListItem[]>([]);
  const intl = useIntl();

  // Initialize message API for notifications
  const [messageApi, contextHolder] = message.useMessage();

  // Define request and response logic for deleting a rule
  const { run: delRun, loading } = useRequest(removeRule, {
    manual: true,
    onSuccess: () => {
      setSelectedRows([]);
      actionRef.current?.reloadAndRest?.();

      messageApi.success('Deleted successfully and will refresh soon');
    },
    onError: () => {
      messageApi.error('Delete failed, please try again');
    },
  });

  // Define columns for ProTable
  const columns: ProColumns<API.RuleListItem>[] = [
    // Column for displaying user name
    {
      title: (
        <FormattedMessage
          id="userName"
          defaultMessage="Name"
        />
      ),
      dataIndex: 'username',
      render: (dom, entity) => {
        return (
          <a
            onClick={() => {
              setCurrentRow(entity);
              setShowDetail(true);
            }}
          >
            {dom}
          </a>
        );
      },
    },
    // Column for displaying phone number
    {
      title: <FormattedMessage id="phone" defaultMessage="Phone Number" />,
      dataIndex: 'phone',
      valueType: 'textarea',
      hideInForm: true,
    },
    // Column for displaying status
    {
      title: <FormattedMessage id="status" defaultMessage="Status" />,
      dataIndex: 'status',
      hideInForm: true,
      valueEnum: {
        0: {
          text: (
            <FormattedMessage
              id="off"
              defaultMessage="Off"
            />
          ),
          status: 'off',
        },
        1: {
          text: (
            <FormattedMessage id="on" defaultMessage="On" />
          ),
          status: 'on',
        }
      },
    },
    // Column for displaying role
    {
      title: <FormattedMessage id="role" defaultMessage="Role" />,
      dataIndex: 'role',
      valueType: 'textarea',
    },
    // Column for operating actions
    {
      title: <FormattedMessage id="pages.searchTable.titleOption" defaultMessage="Operating" />,
      dataIndex: 'option',
      valueType: 'option',
      render: (_, record) => [
        // Placeholder action for certain user roles
        <a 
        style={{display: currentUserRoleId === 3 ? 'inline' : 'none'}}
         >
          --
        </a>,
        // UpdateForm component for updating user information
        <UpdateForm
          trigger={
            <a
              style={{display: record?.currentUserRoleId === 1 ? 'inline' : 'none'}}>
              <FormattedMessage id="update" defaultMessage="Update" />
            </a>
          }
          key="config"
          onOk={actionRef.current?.reload}
          values={{
            ...record,
            currentUserRoleId:currentUserRoleId
          }}
        />,
        // AssignForm component for assigning roles to users
        <AssignForm
          trigger={
            <a >
              <FormattedMessage id="assignRole" defaultMessage="Assign Role" />
            </a>
          }
          key="config"
          onOk={actionRef.current?.reload}
          values={{
            ...record,
            currentUserRoleId:currentUserRoleId
          }}
        />,
        // Delete action for deleting a user
        <a 
          key="subscribeAlert"
          style={{display: currentUserRoleId === 1 ? 'inline' : 'none'}}
          onClick={() => {
            Modal.confirm({
              title: 'delete staff',
              content: 'Are you sure you want to delete this staff?',
              okText: 'Yes',
              cancelText: 'Cancel',
              onOk: () => deleteItem(record.id),
            });
        }}>
          <FormattedMessage
            id="delete"
            defaultMessage="Delete"
          />
        </a>,
      ],
    },
  ];

  // Function to delete a user item
  const deleteItem = async (id: number) => {
    let res = await deleteUserByID(id)
    if(res.code === 200){
      messageApi.success('Deleted successfully and will refresh soon');
      setTimeout(() =>{
        window.location.reload()
      },2000)
    } else {
      messageApi.error('Delete failed, please try again');
    }
    console.log(res,"delete res")
  }; 

  // Function to handle batch removal of selected rows
  const handleRemove = useCallback(
    async (selectedRows: API.RuleListItem[]) => {
      if (!selectedRows?.length) {
        messageApi.warning('Delete node');
        return;
      }
      await delRun({
        data: {
          key: selectedRows.map((row) => row.key),
        },
      });
    },
    [delRun],
  );

  return (
    <PageContainer>
      {contextHolder}
      {/* ProTable component to display user data */}
      <ProTable<API.RuleListItem, API.PageParams>
        headerTitle={intl.formatMessage({
          id: 'Staff',
          defaultMessage: 'Staff',
        })}
        actionRef={actionRef}
        rowKey="key"
        search={{
          labelWidth: 120,
        }}
        toolBarRender={() => [<CreateForm key="create" reload={actionRef.current?.reload} />]}
        request={async (
          params: T & {
            pageSize: number;
            current: number;
          },
        ) => {
          let res1 = await getRoleById(currentUser?.id)
          setCurrentUserRoleId(res1?.data)
          const msg = await getStaffLit(params);
          return {
            data: msg?.data?.list,
            success: msg?.code === 200,
            total: msg?.data?.total,
          };
        }}
        columns={columns}
        rowSelection={{
          onChange: (_, selectedRows) => {
            setSelectedRows(selectedRows);
          },
        }}
      />
      {/* Footer toolbar for batch deletion */}
      {selectedRowsState?.length > 0 && (
        <FooterToolbar
          extra={
            <div>
              <FormattedMessage id="pages.searchTable.chosen" defaultMessage="Chosen" />{' '}
              <a style={{ fontWeight: 600 }}>{selectedRowsState.length}</a>{' '}
              <FormattedMessage id="pages.searchTable.item" defaultMessage="项" />
              &nbsp;&nbsp;
              <span>
                <FormattedMessage
                  id="pages.searchTable.totalServiceCalls"
                  defaultMessage="Total number of service calls"
                />{' '}
                {selectedRowsState.reduce((pre, item) => pre + item.callNo!, 0)}{' '}
                <FormattedMessage id="pages.searchTable.tenThousand" defaultMessage="万" />
              </span>
            </div>
          }
        >
          <Button
            loading={loading}
            onClick={() => {
              handleRemove(selectedRowsState);
            }}
          >
            <FormattedMessage
              id="pages.searchTable.batchDeletion"
              defaultMessage="Batch deletion"
            />
          </Button>
        </FooterToolbar>
      )}

      {/* Drawer component for displaying detailed information */}
      <Drawer
        width={600}
        open={showDetail}
        onClose={() => {
          setCurrentRow(undefined);
          setShowDetail(false);
        }}
        closable={false}
      >
        {currentRow?.name && (
          <ProDescriptions<API.RuleListItem>
            column={2}
            title={currentRow?.name}
            request={async () => ({
              data: currentRow || {},
            })}
            params={{
              id: currentRow?.name,
            }}
            columns={columns as ProDescriptionsItemProps<API.RuleListItem>[]}
          />
        )}
      </Drawer>
    </PageContainer>
  );
};

export default TableList;
