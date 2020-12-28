import React from "react";
import { connect } from 'react-redux';
import MenuSection from "./MenuSection";
import MenuItemSeparator from "./MenuItemSeparator";
import MenuItem from "./MenuItem";

class MenuList extends React.Component {
    render() {
        const { currentUrl, menuConfig, layoutConfig, userRole } = this.props;

        return menuConfig.aside.items.map((child, index) => {
            let accessFlag = false;

            if (child.role) {
                if (child.role.indexOf(userRole) > -1) {
                    accessFlag = true;
                }
            } else {
                accessFlag = true;
            }

            return (
                <React.Fragment key={`menuList${index}`}>
                    {child.section && <MenuSection item={child} />}
                    {child.separator && <MenuItemSeparator item={child} />}
                    {child.title && accessFlag && (
                        <MenuItem
                            item={child}
                            currentUrl={currentUrl}
                            layoutConfig={layoutConfig}
                        />
                    )}
                </React.Fragment>
            );
        });
    }
}

function mapStateToProps(state) {
    return {
        userRole: state.auth.user && state.auth.user.role
    }
}

export default connect(mapStateToProps, null)(MenuList);